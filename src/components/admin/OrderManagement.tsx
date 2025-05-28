
'use client'

import { useState, useEffect } from 'react'
import { FiEdit, FiEye, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi'
import Link from 'next/link'

interface Order {
  _id: string
  invoiceNumber?: string
  userId: {
    _id: string
    name: string
    email: string
  }
  orderItems: Array<{
    product: string
    name: string
    quantity: number
    price: number
    image?: string
  }>
  shipping: {
    name: string
    address: string
    city: string
    postalCode: string
    country: string
    phone: string
  }
  payment: {
    method: string
    status: string
  }
  totalPrice: number
  status: string
  createdAt: string
  updatedAt: string
  notes?: string
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Token'ı cookie'den al
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      console.log('OrderManagement - Token:', token ? `${token.substring(0, 20)}...` : 'Token yok');

      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Siparişler getirilemedi')
      const data = await response.json()
      console.log('OrderManagement - Backend response:', data);
      console.log('OrderManagement - Orders array:', data.orders);
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Siparişleri getirme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (!order || !order.userId) return false;

    const orderNumber = order.invoiceNumber || order._id || '';
    const userName = order.userId?.name || '';
    const userEmail = order.userId?.email || '';

    const matchesSearch = !searchTerm ||
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  })

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Token'ı cookie'den al
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          notes: `Durum güncellendi: ${newStatus}`
        })
      });

      if (!response.ok) throw new Error('Sipariş durumu güncellenemedi');

      // Siparişleri yeniden yükle
      fetchOrders();
    } catch (error) {
      console.error('Sipariş durumu güncelleme hatası:', error);
      alert('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'shipped': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'pending': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Sipariş Yönetimi</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Sipariş ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="processing">İşleniyor</option>
            <option value="shipped">Kargoda</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="cancelled">İptal Edildi</option>
          </select>

          <button
            onClick={fetchOrders}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'Arama kriterlerine uygun sipariş bulunamadı.'
              : 'Henüz sipariş bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.invoiceNumber || `#${order._id.slice(-8)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.userId?.name || 'Bilinmeyen Kullanıcı'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.userId?.email || 'Email yok'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.totalPrice.toLocaleString('tr-TR')} ₺
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status === 'delivered' ? 'Teslim Edildi' :
                       order.status === 'shipped' ? 'Kargoda' :
                       order.status === 'processing' ? 'İşleniyor' :
                       order.status === 'pending' ? 'Beklemede' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Sipariş Detayları"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-black dark:focus:ring-white"
                      >
                        <option value="pending">Beklemede</option>
                        <option value="processing">İşleniyor</option>
                        <option value="shipped">Kargoda</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="cancelled">İptal Edildi</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
