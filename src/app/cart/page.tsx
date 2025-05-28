'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/shared/context/CartContext';

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="text-yellow-400 text-sm">★</span>
    );
  }

  if (hasHalfStar) {
    stars.push(
      <span key="half" className="text-yellow-400 text-sm">☆</span>
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="text-gray-300 text-sm">★</span>
    );
  }

  return stars;
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Sepetiniz</h1>
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-gray-600 mb-6">Sepetinizde ürün bulunmamaktadır.</p>
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" /> Alışverişe devam et
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Sepetiniz</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Ürün</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-gray-500">Adet</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">Fiyat</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.product.id}>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/products/${item.product._id || item.product.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {typeof item.product.category === 'object'
                              ? item.product.category.name
                              : item.product.category}
                          </p>

                          {/* Yıldız Değerlendirme */}
                          {item.product.rating && (
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                {renderStars(item.product.rating)}
                              </div>
                              <span className="text-xs text-gray-500 ml-1">
                                ({item.product.rating})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => updateQuantity(item.product._id || item.product.id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="mx-3 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id || item.product.id, item.quantity + 1)}
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-gray-900">
                            {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                          </span>
                          {item.product.discountPercentage > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                              %{item.product.discountPercentage}
                            </span>
                          )}
                        </div>

                        {/* Eski fiyat ve birim fiyat */}
                        <div className="text-xs text-gray-500 mt-1">
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <div className="line-through">
                              {(item.product.originalPrice * item.quantity).toLocaleString('tr-TR')} ₺
                            </div>
                          )}
                          {item.quantity > 1 && (
                            <div>
                              {item.product.price.toLocaleString('tr-TR')} ₺ / adet
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => removeItem(item.product._id || item.product.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiArrowLeft className="mr-2" /> Alışverişe devam et
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Sipariş Özeti</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ürün Toplamı ({totalItems} ürün)</span>
                <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo</span>
                <span>Ücretsiz</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Toplam</span>
                <span className="font-bold text-lg">{totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-500 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Ödemeye Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}