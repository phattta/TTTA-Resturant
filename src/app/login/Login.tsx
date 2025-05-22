"use client";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
// Remove or comment out this unused import:
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';

export default function Login() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [remember, setRemember] = useState(false);
    // Remove or comment out this unused variable:
    // const router = useRouter();

    useEffect(() => {
        const rememberedName = localStorage.getItem('rememberedName');
        if (rememberedName) {
            setName(rememberedName);
            setRemember(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:1245/api/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                // เก็บข้อมูลผู้ใช้
                if (data.user) {
                    localStorage.setItem('UserName', JSON.stringify(data.user));
                }
                
                // จดจำชื่อถ้าเลือก remember
                if (remember) {
                    localStorage.setItem('rememberedName', name.trim());
                } else {
                    localStorage.removeItem('rememberedName');
                }
                
                // แสดง SweetAlert2 แทนข้อความ success
                Swal.fire({
                    title: 'ล็อกอินสำเร็จ',
                    text: `ยินดีต้อนรับ, ${name}!`,
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false
                }).then(() => {
                    // Reload the page and redirect to home
                    window.location.href = '/';
                });
            } else {
                // แสดง SweetAlert2 แทนข้อความ error
                Swal.fire({
                    title: 'ล็อกอินไม่สำเร็จ',
                    text: data.error || 'โปรดลองอีกครั้ง',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            // แสดง SweetAlert2 สำหรับ network error
            Swal.fire({
                title: 'การเชื่อมต่อกับเซิร์ฟเวอร์ล้มเหลว',
                text: 'กรุณาลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setError('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 text-center">Sign in</h1>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
                        required
                        aria-label="Name"
                    />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="mr-2 cursor-pointer"
                                checked={remember}
                                onChange={e => setRemember(e.target.checked)}
                            />
                            Remember for 30 days
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                
                {error && (
                    <div className="text-red-600 text-center text-sm" role="alert">{error}</div>
                )}
                {success && (
                    <div className="text-green-600 text-center text-sm" role="alert">{success}</div>
                )}
            </div>
        </div>
    );
}
