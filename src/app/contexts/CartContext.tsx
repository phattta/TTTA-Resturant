'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define cart item interface
// Define a type for cart items
export interface CartItem {
    id: number | string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category?: string;
}

interface CartContextType {
    cart: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: number | string) => void;
    updateQuantity: (id: number | string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cartItems');
            if (stored) {
                setCart(JSON.parse(stored));
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cartItems', JSON.stringify(cart));
        }
    }, [cart]);

    const addItem = (item: CartItem) => {
        setCart(prev => {
            const idx = prev.findIndex(i => i.id === item.id);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx].quantity += item.quantity || 1;
                return updated;
            }
            return [...prev, { ...item, quantity: item.quantity || 1 }];
        });
    };

    const removeItem = (id: string | number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string | number, quantity: number) => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return (
        <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}