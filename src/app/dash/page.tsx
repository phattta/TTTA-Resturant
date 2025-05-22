'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserSummary {
  user_name: string
  date: string
  total_daily_amount: string
}

interface DailySummaryResponse {
  date: string
  summaries: UserSummary[]
}

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<DailySummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedDate = localStorage.getItem('selectedDate');
      return savedDate || new Date().toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const fetchDailySummary = async (date: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:1245/api/daily-summary?date=${date}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
      }

      const data = await response.json()
      setSummaryData(data)
    } catch (error) {
      console.error('Error fetching daily summary:', error)
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    localStorage.setItem('selectedDate', date)
  }

  useEffect(() => {
    fetchDailySummary(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const UserName = localStorage.getItem('UserName');
      if (!UserName) {
        router.push('/login');
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  const totalAmount = summaryData?.summaries.reduce(
    (sum, user) => sum + parseFloat(user.total_daily_amount),
    0
  ) || 0

  const usersWithPurchases = summaryData?.summaries.filter(
    user => parseFloat(user.total_daily_amount) > 0
  ).length || 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">สรุปรายวัน</span>
            </h1>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => fetchDailySummary(selectedDate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            รีเฟรชข้อมูล
          </button>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        {summaryData && (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {/* Card for Date */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">วันที่</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">{summaryData.date}</p>
              </div>

              {/* Card for Total Amount */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">ยอดรวมทั้งหมด</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">฿{totalAmount.toFixed(2)}</p>
              </div>

              {/* Card for Users with Purchases */}
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">จำนวนคนที่มีรายการ</h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">{usersWithPurchases} คน</p>
              </div>
            </div>

            {/* Table for User Details */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  รายละเอียดรายบุคคล
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ยอดรวม
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summaryData.summaries.map((user) => {
                      const amount = parseFloat(user.total_daily_amount);
                      const hasAmount = amount > 0;

                      return (
                        <tr key={user.user_name} className={hasAmount ? "hover:bg-blue-50" : "hover:bg-gray-50"}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                {user.user_name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${hasAmount ? 'font-medium text-green-600' : 'text-gray-500'}`}>
                            ฿{user.total_daily_amount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
