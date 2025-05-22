const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const app = express();
const port = 1245;

const cors = require('cors');
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Import Google Sheets API library
const { google } = require('googleapis');

// Path to your service account key file
const KEYFILEPATH = path.join(__dirname,process.env.GOOGLE_SHEETS_ID);
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// Configure the Google Sheets client
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Function to get Google Sheets client
async function getSheetsClient() {
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

// Function to get current date in Thailand timezone
function getThaiDate() {
    const options = { timeZone: 'Asia/Bangkok' };
    const today = new Date();
    return today.toLocaleDateString('en-CA', options); // Returns YYYY-MM-DD format
}

// Example API route
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from the API!' });
});

// Login route (login with name only)
app.post('/api/login', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'users!A:B',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'No users found in sheet' });
        }

        const users = rows.slice(1).map(row => ({ id: row[0], name: row[1] }));
        const user = users.find(u => u.name === name);

        if (user) {
            res.json({ message: `Logged in successfully as ${name}`, user: user });
        } else {
            res.status(401).json({ error: 'Invalid name' });
        }
    } catch (err) {
        console.error('Google Sheets API error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk purchase route - add multiple purchases at once
app.post('/api/bulk-purchase', async (req, res) => {
    const purchases = req.body;

    if (!Array.isArray(purchases) || purchases.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of purchases' });
    }

    const results = [];
    try {
        const sheets = await getSheetsClient();
        const currentDate = getThaiDate();
        const thailandTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });

        // Fetch existing purchases to determine next purchase id
        const purchasesResp = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'purchases!A:A',
        });
        const purchaseRows = purchasesResp.data.values?.slice(1) || [];
        let nextPurchaseId = purchaseRows.length > 0
            ? Math.max(...purchaseRows.map(row => parseInt(row[0], 10)).filter(Number.isFinite)) + 1
            : 1;

        // Fetch existing summaries to determine next summary id and for updating
        const summariesResp = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'daily_summaries!A:D',
        });
        const summaryRows = summariesResp.data.values?.slice(1) || [];
        let nextSummaryId = summaryRows.length > 0
            ? Math.max(...summaryRows.map(row => parseInt(row[0], 10)).filter(Number.isFinite)) + 1
            : 1;

        // Build a map for quick summary lookup: key = `${user_name}-${date}`
        const summaryMap = new Map();
        summaryRows.forEach((row, idx) => {
            const userName = row[1];
            const date = row[2];
            if (userName && date) {
                summaryMap.set(`${userName}-${date}`, { row, rowIndex: idx + 2, id: row[0] }); // +2 for header and 1-based index
            }
        });

        for (const purchase of purchases) {
            const { name, item_name, price } = purchase;
            let quantity = parseInt(purchase.quantity, 10);
            if (isNaN(quantity) || quantity < 1) quantity = 1;

            if (!name || !item_name || price === undefined) {
                results.push({ purchase, success: false, error: 'Name, item_name, and price are required' });
                continue;
            }

            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                results.push({ purchase, success: false, error: 'Invalid price' });
                continue;
            }

            // Prepare purchase rows with auto-incremented id and user_name
            const purchaseRowsToAppend = [];
            for (let i = 0; i < quantity; i++) {
                purchaseRowsToAppend.push([
                    nextPurchaseId++, // id
                    name,            // user_name
                    thailandTime,    // purchase_date
                    item_name,       // item_name
                    parsedPrice      // price
                ]);
            }

            // Append purchases
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'purchases!A:E',
                valueInputOption: 'USER_ENTERED',
                resource: { values: purchaseRowsToAppend }
            });

            // Update or insert daily summary (one row per user_name per day)
            const summaryKey = `${name}-${currentDate}`;
            const totalAmountForSummary = parsedPrice * quantity;
            if (summaryMap.has(summaryKey)) {
                // Update existing summary
                const { row, rowIndex } = summaryMap.get(summaryKey);
                const existingTotal = parseFloat(row[3]) || 0;
                const newTotal = existingTotal + totalAmountForSummary;
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `daily_summaries!D${rowIndex}`,
                    valueInputOption: 'USER_ENTERED',
                    resource: { values: [[newTotal]] }
                });
            } else {
                // Insert new summary row
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: 'daily_summaries!A:D',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[nextSummaryId++, name, currentDate, totalAmountForSummary]]
                    }
                });
                summaryMap.set(summaryKey, { row: [nextSummaryId - 1, name, currentDate, totalAmountForSummary], rowIndex: summaryRows.length + 2, id: nextSummaryId - 1 });
            }

            results.push({ purchase, success: true, data: { userName: name, totalAmount: totalAmountForSummary } });
        }

        res.status(200).json({
            message: 'Bulk purchase processing completed',
            results
        });

    } catch (err) {
        console.error('Google Sheets API error during bulk purchase:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Daily summary route
app.get('/api/daily-summary', async (req, res) => {
    const { name, date } = req.query;
    const targetDate = date || getThaiDate();

    try {
        const sheets = await getSheetsClient();

        // Fetch all purchases data
        const purchasesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'purchases!A:E',
        });

        // Fetch all users data
        const usersResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'users!A:B',
        });

        const users = usersResponse.data.values?.slice(1) || [];
        const purchases = purchasesResponse.data.values?.slice(1) || [];

        // Map user name for lookup
        const userNameSet = new Set(users.map(userRow => userRow[1]));

        // Calculate daily totals from purchases for the target date
        const dailyTotals = new Map();

        for (const purchaseRow of purchases) {
            // Columns: id (0), user_name (1), purchase_date (2), item_name (3), price (4)
            const userName = purchaseRow[1];
            const purchaseDateStr = purchaseRow[2];
            const priceStr = purchaseRow[4];

            if (!userName || !purchaseDateStr || priceStr === undefined) continue;

            const price = parseFloat(priceStr);
            if (isNaN(price)) continue;

            try {
                const purchaseDate = new Date(purchaseDateStr);
                if (isNaN(purchaseDate.getTime())) continue;
                const purchaseDateFormatted = purchaseDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

                if (purchaseDateFormatted === targetDate) {
                    const currentTotal = dailyTotals.get(userName) || 0;
                    dailyTotals.set(userName, currentTotal + price);
                }
            } catch {
                continue;
            }
        }

        if (name) {
            // If a specific user name is requested
            if (!userNameSet.has(name)) {
                return res.status(404).json({ error: 'User not found' });
            }

            const totalAmount = dailyTotals.get(name) || 0;

            res.json({
                user_name: name,
                date: targetDate,
                total_daily_amount: totalAmount.toFixed(2)
            });
        } else {
            // Return all users with their total for the target date
            const summaries = users.map(userRow => {
                const userName = userRow[1];
                const totalAmount = dailyTotals.get(userName) || 0;
                return {
                    user_name: userName,
                    date: targetDate,
                    total_daily_amount: totalAmount.toFixed(2)
                };
            });
            res.json({
                date: targetDate,
                summaries
            });
        }
    } catch (err) {
        console.error('Google Sheets API error during daily summary calculation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});