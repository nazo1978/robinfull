'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Sepet verilerini localStorage'dan yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Sepet verileri yüklenemedi:', error);
      }
    }
  }, []);

  // Sepet verilerini localStorage'a kaydet
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    console.log('CartContext addItem çağrıldı:', { product, quantity });

    setItems((prevItems) => {
      console.log('Önceki sepet öğeleri:', prevItems);

      // ID kontrolü için hem id hem _id'yi kontrol et
      const productId = product.id || product._id;
      console.log('Product ID:', productId);

      const existingItem = prevItems.find((item) =>
        (item.product.id === productId) || (item.product._id === productId)
      );

      console.log('Mevcut öğe bulundu mu:', existingItem);

      if (existingItem) {
        const updatedItems = prevItems.map((item) => {
          const itemId = item.product.id || item.product._id;
          return itemId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
        console.log('Güncellenen sepet öğeleri:', updatedItems);
        return updatedItems;
      } else {
        const newItems = [...prevItems, { product, quantity }];
        console.log('Yeni sepet öğeleri:', newItems);
        return newItems;
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        const itemId = item.product.id || item.product._id;
        return itemId === productId ? { ...item, quantity } : item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => {
        const itemId = item.product.id || item.product._id;
        return itemId !== productId;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};