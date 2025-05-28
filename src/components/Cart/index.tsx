'use client';

import React, { useState } from 'react';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/shared/context/CartContext';

const Cart: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center text-gray-700 hover:text-black"
      >
        <FiShoppingCart size={24} />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 md:w-96 bg-black rounded-lg shadow-lg z-50 max-h-[80vh] overflow-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Sepetim ({items.length})</h3>
          </div>

          {items.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Sepetiniz boş
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-200 max-h-64 overflow-auto">
                {items.map((item) => (
                  <li key={item.product.id} className="p-4">
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="text-sm font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.product.price.toLocaleString('tr-TR')} ₺
                        </p>
                        <div className="flex items-center mt-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id || item.product.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="text-gray-500 hover:text-black"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="mx-2 text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id || item.product.id,
                                item.quantity + 1
                              )
                            }
                            className="text-gray-500 hover:text-black"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id || item.product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Toplam:</span>
                  <span className="font-bold">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-white border border-gray-300 text-black py-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sepeti Görüntüle
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
                  >
                    Ödemeye Geç
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;