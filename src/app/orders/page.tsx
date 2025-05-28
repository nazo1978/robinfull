'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiSearch, FiPackage, FiTruck, FiCheck, FiClock } from 'react-icons/fi';

// Sipariş verileri API'den gelecek
const mockOrders: any[] = [];

const statusIcons: Record<string, React.ReactNode> = {
  ordered: <FiClock className="text-blue-500" />,
  processing: <FiPackage className="text-orange-500" />,
  shipped: <FiTruck className="text-purple-500" />,
  delivered: <FiCheck className="text-green-500" />,
};

const statusLabels: Record<string, string> = {
  ordered: 'Sipariş Alındı',
  processing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  delivered: 'Teslim Edildi',
};

export default function OrdersPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const order = mockOrders.find(order => order.id === trackingNumber);
    setSearchedOrder(order);
    setSearchAttempted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-black mb-8"
      >
        <FiArrowLeft className="mr-2" /> Ana Sayfaya Dön
      </Link>

      <h1 className="text-3xl font-bold mb-8">Sipariş Takip</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Sipariş Numarası
            </label>
            <div className="relative">
              <input
                type="text"
                id="trackingNumber"
                name="trackingNumber"
                placeholder="Örn: RH-123456"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors self-end"
          >
            Sipariş Ara
          </button>
        </form>
      </div>

      {searchAttempted && (
        <>
          {searchedOrder ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Sipariş #{searchedOrder.id}</h2>
                    <p className="text-gray-500">
                      {new Date(searchedOrder.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${searchedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        searchedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        searchedOrder.status === 'processing' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'}`
                    }>
                      {statusIcons[searchedOrder.status]}
                      <span className="ml-2">{statusLabels[searchedOrder.status]}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium mb-4">Sipariş Durumu</h3>
                <div className="relative">
                  <div className="absolute left-4 inset-y-0 w-0.5 bg-gray-200"></div>
                  <ul className="space-y-6 relative">
                    {searchedOrder.timeline.map((event: any, index: number) => (
                      <li key={index} className="ml-6">
                        <div className="absolute -left-6 mt-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200">
                          {statusIcons[event.status]}
                        </div>
                        <p className="font-medium">{event.text}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Sipariş Detayları</h3>
                <div className="space-y-4">
                  {searchedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex py-3">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{item.quantity} adet</span>
                          <span className="text-sm font-medium">
                            {item.price.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium">Toplam</span>
                      <span className="font-bold">
                        {searchedOrder.total.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 mb-2">
                "{trackingNumber}" numaralı sipariş bulunamadı.
              </p>
              <p className="text-gray-500 text-sm">
                Lütfen sipariş numaranızı kontrol edip tekrar deneyin.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}