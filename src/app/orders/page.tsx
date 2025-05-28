'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import orderService, { Order, OrderStatus, PaymentStatus } from '@/services/OrderService';
import authService from '@/services/AuthService';

const UserOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Auth kontrolü
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Siparişleri yükle
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getMyOrders({
        pageNumber: currentPage,
        pageSize
      });

      if (response.success && response.data) {
        setOrders(response.data.orders);
        setTotalCount(response.data.totalCount);
      } else {
        setError(response.error || 'Siparişler yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      console.error('Load orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  // Siparişi iptal et
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await orderService.cancelOrder(orderId);

      if (response.success) {
        await loadOrders(); // Listeyi yenile
      } else {
        alert(response.error || 'Sipariş iptal edilirken hata oluştu');
      }
    } catch (err) {
      alert('Beklenmeyen bir hata oluştu');
      console.error('Cancel order error:', err);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Siparişleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
          <p className="mt-2 text-gray-600">Geçmiş siparişlerinizi görüntüleyin ve takip edin</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sipariş #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdDate).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${orderService.getOrderStatusColor(order.status)}`}>
                        {orderService.getOrderStatusText(order.status)}
                      </span>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${orderService.getPaymentStatusColor(order.paymentStatus)}`}>
                        {orderService.getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ₺{order.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.orderItems.length} ürün
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span>Adet: {item.quantity}</span>
                          <span className="mx-2">•</span>
                          <span>₺{item.unitPrice.toFixed(2)}</span>
                          {item.discountRate > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-green-600">%{item.discountRate} indirim</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ₺{item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="text-sm text-gray-600 text-center py-2">
                      +{order.orderItems.length - 3} ürün daha
                    </div>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <div><strong>Teslimat:</strong> {order.shippingName}</div>
                    <div>{order.shippingCity}, {order.shippingCountry}</div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Detayları Gör
                    </button>
                    {(order.status === OrderStatus.Pending || order.status === OrderStatus.Processing) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        İptal Et
                      </button>
                    )}
                    {order.status === OrderStatus.Delivered && (
                      <button
                        onClick={() => router.push(`/products/${order.orderItems[0]?.productId}/review`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Değerlendir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Önceki
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Sonraki
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Henüz sipariş vermediniz</div>
            <p className="text-gray-400 mt-2">İlk siparişinizi vermek için ürünleri keşfedin</p>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ürünleri Keşfet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;