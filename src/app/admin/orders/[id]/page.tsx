'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import orderService, { Order, OrderStatus, PaymentStatus } from '@/services/OrderService';
import authService from '@/services/AuthService';

const AdminOrderDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Auth kontrolü
  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // Sipariş detayını yükle
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrderById(orderId);

      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.error || 'Sipariş yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
      console.error('Load order error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Sipariş durumu güncelle
  const handleStatusUpdate = async (status: OrderStatus, paymentStatus?: PaymentStatus) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      const response = await orderService.updateOrderStatus(order.id, status, paymentStatus);
      
      if (response.success) {
        await loadOrder(); // Detayı yenile
      } else {
        alert(response.error || 'Durum güncellenirken hata oluştu');
      }
    } catch (err) {
      alert('Beklenmeyen bir hata oluştu');
      console.error('Update status error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş detayı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">Hata</div>
          <p className="mt-2 text-gray-600">{error || 'Sipariş bulunamadı'}</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Siparişlere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/orders')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Siparişlere Dön
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Sipariş #{order.orderNumber}
              </h1>
              <p className="mt-2 text-gray-600">
                {new Date(order.createdDate).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${orderService.getOrderStatusColor(order.status)}`}>
                {orderService.getOrderStatusText(order.status)}
              </div>
              <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${orderService.getPaymentStatusColor(order.paymentStatus)}`}>
                {orderService.getPaymentStatusText(order.paymentStatus)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sipariş Öğeleri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Öğeleri</h2>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.productName}</h3>
                      {item.productDescription && (
                        <p className="text-sm text-gray-600 mt-1">{item.productDescription}</p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>Adet: {item.quantity}</span>
                        <span className="mx-2">•</span>
                        <span>Birim Fiyat: ₺{item.unitPrice.toFixed(2)}</span>
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
                      {item.discountAmount > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          ₺{item.originalTotalPrice?.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teslimat Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Bilgileri</h2>
              <div className="space-y-2">
                <div><strong>Ad Soyad:</strong> {order.shippingName}</div>
                <div><strong>Adres:</strong> {order.shippingAddress}</div>
                <div><strong>Şehir:</strong> {order.shippingCity}</div>
                <div><strong>Posta Kodu:</strong> {order.shippingPostalCode}</div>
                <div><strong>Ülke:</strong> {order.shippingCountry}</div>
                <div><strong>Telefon:</strong> {order.shippingPhone}</div>
              </div>
            </div>

            {/* Notlar */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Notları</h2>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Sipariş Özeti */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ürünler:</span>
                  <span>₺{order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vergi:</span>
                  <span>₺{order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo:</span>
                  <span>₺{order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam:</span>
                    <span>₺{order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ödeme Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Bilgileri</h2>
              <div className="space-y-2">
                <div><strong>Yöntem:</strong> {orderService.getPaymentMethodText(order.paymentMethod)}</div>
                <div><strong>Durum:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${orderService.getPaymentStatusColor(order.paymentStatus)}`}>
                    {orderService.getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
                {order.paymentDate && (
                  <div><strong>Ödeme Tarihi:</strong> {new Date(order.paymentDate).toLocaleDateString('tr-TR')}</div>
                )}
              </div>
            </div>

            {/* Durum Güncelleme */}
            {order.status !== OrderStatus.Delivered && order.status !== OrderStatus.Cancelled && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Durum Güncelle</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusUpdate(OrderStatus.Processing)}
                    disabled={updating || order.status >= OrderStatus.Processing}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    İşleme Al
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(OrderStatus.Shipped)}
                    disabled={updating || order.status >= OrderStatus.Shipped}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kargoya Ver
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(OrderStatus.Delivered, PaymentStatus.Paid)}
                    disabled={updating || order.status >= OrderStatus.Delivered}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Teslim Edildi
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(OrderStatus.Cancelled)}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    İptal Et
                  </button>
                </div>
              </div>
            )}

            {/* Tarihler */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Önemli Tarihler</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Oluşturulma:</strong> {new Date(order.createdDate).toLocaleDateString('tr-TR')}</div>
                {order.shippedDate && (
                  <div><strong>Kargo:</strong> {new Date(order.shippedDate).toLocaleDateString('tr-TR')}</div>
                )}
                {order.deliveredDate && (
                  <div><strong>Teslimat:</strong> {new Date(order.deliveredDate).toLocaleDateString('tr-TR')}</div>
                )}
                {order.paymentDate && (
                  <div><strong>Ödeme:</strong> {new Date(order.paymentDate).toLocaleDateString('tr-TR')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
