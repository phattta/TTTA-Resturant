"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu, X, User } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '../contexts/CartContext'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [userName, setUserName] = useState<string | null>(null)
    const { totalItems } = useCart() // Get total items from cart context

    // เพิ่ม useEffect เพื่อโหลดชื่อผู้ใช้จาก localStorage
    useEffect(() => {
        const user = localStorage.getItem('UserName')
        if (user) {
            try {
                const userData = JSON.parse(user)
                setUserName(userData.name)
                // Add a check to reload once when user data is first loaded
                const hasReloaded = sessionStorage.getItem('hasReloaded')
                if (!hasReloaded) {
                    sessionStorage.setItem('hasReloaded', 'true')
                    window.location.reload()
                }
            } catch (e) {
                console.error('Error parsing user data:', e)
            }
        }
    }, [])

    return (
        <div className="w-full top-0 z-50 bg-transparent">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
                <Link href="/">
                    <Image
                        src="/Logo.svg"
                        alt='logo'
                        height={60}
                        width={60}
                        className="w-auto h-12 sm:h-16 md:h-20 cursor-pointer"
                    />
                </Link>

                
                <div className="hidden md:flex items-center gap-4 lg:gap-8 text-[#001030] font-medium text-sm lg:text-base">
                    {userName ? (
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{userName}</span>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="text-black bg-white hover:bg-gray-100 py-2 px-6 lg:px-10 rounded-xl transition-colors duration-200 shadow-sm"
                        >
                            Login
                        </Link>
                    )}
                    <Link href="/basket" className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    {userName && (
                        <div>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('UserName');
                                    sessionStorage.removeItem('hasReloaded');
                                    window.location.reload();
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                LogOut
                            </button>
                        </div>
                    )}
                    <div>
                        <Link href="/dash">
                            <p>
                                Goto DashBoard
                            </p>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:hidden">
                    <Link href="/basket" className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg md:hidden transform transition-transform duration-300 ease-in-out z-50">
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col p-4 space-y-4">
                            {userName ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{userName}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('UserName');
                                            sessionStorage.removeItem('hasReloaded');
                                            window.location.reload();
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        LogOut
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-black bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-xl text-center"
                                >
                                    Login
                                </Link>
                            )}
                            <Link href="/dash" className="text-[#001030] py-2">
                                Goto Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
