"use client"

import React, { useEffect, useState } from 'react'
import { useCart } from '../contexts/CartContext'
// import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Define cart item interface
interface CartItem {
  id: string | number; // <-- Change this line
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart()
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    try {
      if (typeof window !== 'undefined') {
        const UserName = localStorage.getItem('UserName');
        if (!UserName) {
          router.push('/login');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking user authentication:', error);
      router.push('/login');
    }
  }, [router]);

  const totalPrice = cart?.reduce((total: number, item: CartItem) => {
    return total + (item.price * item.quantity)
  }, 0) || 0

  const handleBulkPurchase = async () => {
    if (!cart || cart.length === 0) {
      toast.error('ตะกร้าว่างเปล่า');
      return;
    }

    let userName = "unknown";
    try {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('UserName');
        if (!userStr) {
          toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
          router.push('/login');
          return;
        }
        const userObj = JSON.parse(userStr);
        userName = userObj.name || "unknown";
      }
    } catch (e) {
      console.error('Error getting username:', e);
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้');
      return;
    }

    const payload = cart.map((item: CartItem) => ({
      name: userName,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    try {
      const response = await fetch('http://localhost:1245/api/bulk-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove this line if not used:
      // const data = await response.json();

      toast.success('สั่งซื้อสำเร็จ!');
      clearCart();
      router.push('/'); // Redirect to orders page after successful purchase
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('สั่งซื้อไม่สำเร็จ กรุณาลองใหม่');
    }
  }

  if (!isClient) {
    return null; // Prevent hydration errors by not rendering until client-side
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">ตะกร้าสินค้า</h2>
            <p className="mt-4 text-lg text-gray-500">ตะกร้าของคุณว่างเปล่า</p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                กลับไปเลือกสินค้า
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">ตะกร้าสินค้า</h2>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <ul className="divide-y divide-gray-200">
            {cart.map((item: CartItem) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 relative">
                      {/* <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      /> */}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">฿{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center border rounded-md mr-4">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => {
                        removeItem(item.id);
                        toast.success('ลบสินค้าเรียบร้อย');
                      }}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex justify-between text-lg font-medium">
            <span>ยอดรวมทั้งหมด</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </div>
          
          <div className="mt-6">
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
              onClick={handleBulkPurchase}
            >
              ดำเนินการสั่งซื้อ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}