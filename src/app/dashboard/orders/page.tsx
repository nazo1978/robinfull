'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiPackage, FiClock, FiCheck, FiX, FiTruck } from 'react-icons/fi';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  payment: {
    method: string;
    status: string;
  };
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/dashboard/orders'));
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      // Token'ı cookie'den al
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      console.log('Dashboard Orders - Token:', token ? `${token.substring(0, 20)}...` : 'Token yok');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Siparişler getirilirken bir hata oluştu');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error('Siparişler getirilirken hata:', error);
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-yellow-500" />;
      case 'processing':
        return <FiPackage className="text-blue-500" />;
      case 'shipped':
        return <FiTruck className="text-purple-500" />;
      case 'delivered':
        return <FiCheck className="text-green-500" />;
      case 'cancelled':
        return <FiX className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'processing':
        return 'İşleniyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Siparişlerim</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tüm siparişlerinizi buradan takip edebilirsiniz.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Henüz siparişiniz yok
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Alışverişe başlamak için ürünlerimizi inceleyin.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Ürünleri İncele
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sipariş #{order._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium">
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-3">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Adet: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Toplam:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {order.totalPrice.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Teslimat Adresi:</strong></p>
                  <p>
                    {order.shipping.firstName} {order.shipping.lastName}<br />
                    {order.shipping.address}<br />
                    {order.shipping.city} {order.shipping.postalCode}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
