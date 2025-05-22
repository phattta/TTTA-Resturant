"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation'
interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
};
export default function Products() {
    const router = useRouter();
    useEffect(() => {
        const UserName = localStorage.getItem('UserName');
        if (!UserName) {
            router.push('/login');
        }
    }, [router]);
    const { addItem: addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState('ข้าว');
    // Rest of your existing code...
    const products: Product[] = [
        { id: 1, name: "ข้าวกระเพราหมูสับไข่ดาว", price: 50, image: "/Home1.png", category: "ข้าว" },
        { id: 2, name: "ข้าวกระเพราไก่ไข่ดาว", price: 50, image: "/Home2.png", category: "ข้าว" },
        { id: 3, name: "ข้าวกระเพราเครื่องในไก่ไข่ดาว", price: 50, image: "/Home3.png", category: "ข้าว" },
        { id: 4, name: "น้ำเปล่า", price: 40, image: "/Home4.png", category: "น้ำ" },
        { id: 5, name: "น้ำโออิชิ", price: 40, image: "/Home5.png", category: "น้ำ" },
        { id: 6, name: "น้ำแป๊บซี่", price: 40, image: "/Home6.png", category: "น้ำ" },
        { id: 7, name: "นมวัว", price: 40, image: "/Home7.png", category: "นม" },
        { id: 8, name: "นมวัว", price: 40, image: "/Home7.png", category: "นม" },
        { id: 9, name: "นมวัว", price: 40, image: "/Home7.png", category: "นม" },
        { id: 10, name: "คุกกี้", price: 40, image: "/Products2.svg", category: "ขนม" },
        { id: 11, name: "คุกกี้", price: 40, image: "/Products3.svg", category: "ขนม" },
        { id: 12, name: "คุกกี้", price: 40, image: "/Products7.svg", category: "ขนม" },
    ];
    // Your existing state and handlers...
    const [customProducts, setCustomProducts] = useState<{ id: number, name: string, price: number }[]>([
        { id: Date.now(), name: '', price: 0 }
    ]);
    const [confirmedCustomProducts] = useState<{ id: number, name: string, price: number, category: string }[]>([]);
    // Keep all your existing handlers...
    const handleCustomProductChange = (idx: number, field: 'name' | 'price', value: string) => {
        setCustomProducts(prev =>
            prev.map((prod, i) =>
                i === idx ? { ...prod, [field]: field === 'price' ? Number(value) : value } : prod
            )
        );
    };
    const handleAddCustomProductField = () => {
        setCustomProducts(prev => [
            ...prev,
            { id: Date.now() + Math.floor(Math.random() * 10000), name: '', price: 0 }
        ]);
    };
    const handleRemoveCustomProductField = (idx: number) => {
        setCustomProducts(prev => prev.filter((_, i) => i !== idx));
    };
    const handleConfirmAllCustomProducts = () => {
        let hasValid = false;
        customProducts.forEach(prod => {
            if (prod.name && prod.price > 0) {
                addToCart({
                    id: Date.now() + Math.floor(Math.random() * 10000),
                    name: prod.name,
                    price: prod.price,
                    image: "/Products1.svg",
                    quantity: 1
                });
                hasValid = true;
            }
        });
        if (hasValid) {
            toast.success('เพิ่มสินค้าทั้งหมดลงในตระกร้าแล้ว', {
                duration: 2000,
                position: 'bottom-center',
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '10px',
                },
                icon: '✓'
            });
            setCustomProducts(customProducts.map(prod => ({ ...prod, name: '', price: 0 })));
        } else {
            toast.error('กรุณากรอกชื่อสินค้าและราคาที่ถูกต้องอย่างน้อย 1 รายการ');
        }
    };
    
    // const handleConfirmCustomProduct = (idx: number) => {
    //     const prod = customProducts[idx];
    //     if (prod.name && prod.price > 0) {
    //         addToCart({
    //             id: Date.now() + Math.floor(Math.random() * 10000),
    //             name: prod.name,
    //             price: prod.price,
    //             image: "/Products1.svg",
    //             quantity: 1
    //         });
    //         toast.success('เพิ่มสินค้าลงในตระกร้าแล้ว', {
    //             duration: 2000,
    //             position: 'bottom-center',
    //             style: {
    //                 background: '#4CAF50',
    //                 color: '#fff',
    //                 padding: '16px',
    //                 borderRadius: '10px',
    //             },
    //             icon: '✓'
    //         });
    //         // Clear the input row after confirming
    //         setCustomProducts(prev =>
    //             prev.map((p, i) => i === idx ? { ...p, name: '', price: 0 } : p)
    //         );
    //     } else {
    //         toast.error('กรุณากรอกชื่อสินค้าและราคาที่ถูกต้อง');
    //     }
    // };

    // Add custom products to the product list for display
    const allProducts = [
        ...products,
        ...confirmedCustomProducts
    ];

    // กรองสินค้าตามหมวดหมู่ที่เลือก
    const filteredProducts = allProducts.filter(product => product.category === selectedCategory);

    const handleAddItem = (product: Product & { quantity?: number }) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: product.quantity || 1
        });

        // แสดง toast notification
        toast.success('คุณได้ทำการเพิ่มสินค้าลงในตระกร้าแล้ว', {
            duration: 2000,
            position: 'bottom-center',
            style: {
                background: '#4CAF50',
                color: '#fff',
                padding: '16px',
                borderRadius: '10px',
            },
            icon: '✓'
        });
    };

    return (
        <div className="py-30 md:py-24 bg-gray-100 min-h-screen">
            <Toaster />
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-center text-black">
                    ร้านแม่กบ v1.0.0
                </h2>
                <div className='text-red-500 text-xs text-center'>อยู่ระหว่างการพัฒนาและทดสอบ</div>

                {/* เมนูการเลือกประเภทอาหาร */}
                <div className="flex flex-wrap justify-center gap-4 md:space-x-8 mb-8 md:mb-12">
                    {['ข้าว', 'น้ำ', 'นม', 'ขนม'].map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`text-base md:text-lg font-medium transition-all px-2 py-1 ${selectedCategory === category
                                ? 'text-[#8b3d20] border-b-2 border-[#8b3d20]'
                                : 'text-gray-600 hover:text-[#8b3d20] hover:border-b-2 hover:border-[#8b3d20]'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Custom Product Input Section */}
                <div className="p-4 mb-8 w-full">
                    <h3 className="text-lg font-bold mb-2 text-[#8b3d20]">เพิ่มรายการเอง</h3>
                    {customProducts.map((prod, idx) => (
                        <div key={prod.id} className="flex flex-col md:flex-row items-center gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="ชื่อสินค้า"
                                value={prod.name}
                                onChange={e => handleCustomProductChange(idx, 'name', e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                            <input
                                type="number"
                                placeholder="ราคา"
                                min={1}
                                value={prod.price > 0 ? prod.price : ''}
                                onChange={e => handleCustomProductChange(idx, 'price', e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveCustomProductField(idx)}
                                className="text-red-500 px-2 py-1"
                                disabled={customProducts.length === 1}
                            >
                                ลบ
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                        <button
                            type="button"
                            onClick={handleAddCustomProductField}
                            className="px-4 py-2 bg-[#8b3d20] text-white rounded hover:bg-[#a14f27] transition-colors"
                        >
                            + เพิ่มสินค้า
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmAllCustomProducts}
                            className="px-4 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#388e3c] transition-colors"
                        >
                            ยืนยันทั้งหมด
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="relative shadow-md rounded-lg overflow-hidden h-[310px] md:h-[400px]">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/Products1.svg"
                                    alt="Product Background"
                                    className="w-full h-full object-cover"
                                    fill
                                />
                            </div>
                            <div className="relative flex justify-center items-center h-[180px] md:h-[250px]">
                                {/* <Image
                                    src={product.image}
                                    alt={product.name}
                                    className="object-contain w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
                                    width={200}
                                    height={200}
                                /> */}
                            </div>
                            <div className="relative p-3 md:p-4 z-10">
                                <div className="flex flex-col gap-0">
                                    <div className="flex flex-col">
                                        <span className="text-lg md:text-xl font-bold text-white">฿{product.price}</span>
                                        <p className="text-base md:text-xl font-semibold text-white line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">{product.name}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => {
                                                    const quantity = document.getElementById(`quantity-${product.id}`) as HTMLInputElement;
                                                    const newValue = Math.max(1, parseInt(quantity.value) - 1);
                                                    quantity.value = newValue.toString();
                                                }}
                                                className="px-2 py-1 text-gray-600 bg-white rounded"
                                            >
                                                -
                                            </button>
                                            <input
                                                id={`quantity-${product.id}`}
                                                type="number"
                                                defaultValue="1"
                                                min="1"
                                                className="w-8 text-center border-none focus:outline-none"
                                                readOnly
                                            />
                                            <button
                                                onClick={() => {
                                                    const quantity = document.getElementById(`quantity-${product.id}`) as HTMLInputElement;
                                                    const newValue = parseInt(quantity.value) + 1;
                                                    quantity.value = newValue.toString();
                                                }}
                                                className="px-2 py-1 text-gray-600 bg-white rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const quantityElement = document.getElementById(`quantity-${product.id}`);
                                                if (quantityElement instanceof HTMLInputElement) {
                                                    const quantity = parseInt(quantityElement.value) || 1;
                                                    handleAddItem({
                                                        ...product, quantity,
                                                        image: ''
                                                    });
                                                }
                                            }}
                                            className="bg-[#8b3d20] text-white py-2 px-4 rounded-lg text-base font-medium flex items-center gap-2 hover:bg-[#a14f27] transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                            เพิ่ม
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
