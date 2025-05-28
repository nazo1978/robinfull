'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/shared/context/AuthContext'
import {
  FiHome, FiPackage, FiUsers, FiDollarSign, FiSettings,
  FiLogOut, FiPlusCircle, FiBarChart2, FiShoppingBag,
  FiShield, FiGlobe, FiAlertCircle, FiUserPlus, FiGrid, FiGift, FiRefreshCw, FiTrendingUp, FiImage
} from 'react-icons/fi'
import ProductManagement from '@/components/admin/ProductManagement'
import UserManagement from '@/components/admin/UserManagement'
import OrderManagement from '@/components/admin/OrderManagement'
import AuctionManagement from '@/components/admin/AuctionManagement'
import CategoryManagement from '@/components/admin/CategoryManagement'
import LotteryManagement from '@/components/admin/LotteryManagement'
import AdminLotteryTickets from '@/components/admin/AdminLotteryTickets'
import CompanyManagement from '@/components/admin/CompanyManagement'
import AdminExchangeManagement from '@/components/admin/AdminExchangeManagement'
import DynamicPricingManagement from '@/components/Admin/DynamicPricingManagement'
import BannerManagement from '@/components/Admin/BannerManagement'
import SiteSettingsManagement from '@/components/Admin/SiteSettingsManagement'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardStats {
  totalProducts: number
  monthlyOrders: number
  totalUsers: number
  activeLotteries: number
}

interface RecentOrder {
  _id: string
  invoiceNumber?: string
  userId: {
    name: string
    email: string
  }
  totalPrice: number
  status: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout, isLoading, token } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    monthlyOrders: 0,
    totalUsers: 0,
    activeLotteries: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  // Dashboard istatistiklerini getir
  const fetchDashboardStats = async () => {
    try {
      if (!token) return;

      // Paralel olarak tüm istatistikleri getir
      const [ordersRes, recentOrdersRes] = await Promise.all([
        fetch('http://localhost:5128/api/orders/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5128/api/orders?limit=5&sort=createdAt&order=desc', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setStats(prev => ({
            ...prev,
            monthlyOrders: ordersData.stats.totalOrders || 0
          }));
        }
      }

      if (recentOrdersRes.ok) {
        const recentOrdersData = await recentOrdersRes.json();
        if (recentOrdersData.success) {
          setRecentOrders(recentOrdersData.orders || []);
        }
      }
    } catch (error) {
      console.error('Dashboard istatistikleri getirilirken hata:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    // AuthContext'ten gelen loading bitene kadar bekle
    if (isLoading) return;

    // Admin kontrolü
    if (!isAuthenticated || !isAdmin) {
      router.push('/auth/login');
      return;
    }

    // Admin doğrulandıktan sonra istatistikleri getir
    fetchDashboardStats();
  }, [isLoading, isAuthenticated, isAdmin, router, token])

  const handleLogout = () => {
    logout();
    router.push('/');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin || !user) {
    return null // Router already redirecting
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: FiHome },
    { id: 'products', label: 'Ürünler', icon: FiPackage },
    { id: 'categories', label: 'Kategoriler', icon: FiGrid },
    { id: 'orders', label: 'Siparişler', icon: FiShoppingBag },
    { id: 'users', label: 'Kullanıcılar', icon: FiUsers },
    { id: 'companies', label: 'Şirketler', icon: FiUserPlus },
    { id: 'auctions', label: 'Açık Artırmalar', icon: FiDollarSign },
    { id: 'exchange', label: 'Takas Yönetimi', icon: FiRefreshCw },
    { id: 'lotteries', label: 'Çekilişler', icon: FiGift },
    { id: 'lottery-tickets', label: 'Çekiliş Biletleri', icon: FiGift },
    { id: 'dynamic-pricing', label: 'Dinamik Fiyatlandırma', icon: FiTrendingUp },
    { id: 'banners', label: 'Banner Yönetimi', icon: FiImage },
    { id: 'site-settings', label: 'Site Ayarları', icon: FiSettings },
    { id: 'sales', label: 'Satış Raporları', icon: FiBarChart2 },
    { id: 'settings', label: 'Sistem Ayarları', icon: FiSettings },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <FiShield className="h-8 w-8 text-black dark:text-white mr-2" />
            <h1 className="text-xl font-bold">RobinHoot Admin</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <FiUsers className="text-gray-600 dark:text-gray-300" />
              </div>
              <div className="ml-3">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Çıkış Yap
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold">
              {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <FiPackage className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Ürün</p>
                      <p className="text-2xl font-semibold">
                        {statsLoading ? '...' : stats.totalProducts}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <FiShoppingBag className="h-6 w-6 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aylık Sipariş</p>
                      <p className="text-2xl font-semibold">
                        {statsLoading ? '...' : stats.monthlyOrders}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                      <FiUsers className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Kullanıcı</p>
                      <p className="text-2xl font-semibold">
                        {statsLoading ? '...' : stats.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <FiGift className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif Çekiliş</p>
                      <p className="text-2xl font-semibold">
                        {statsLoading ? '...' : stats.activeLotteries}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Son Siparişler</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Tümünü Gör
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Müşteri</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutar</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {statsLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              Yükleniyor...
                            </td>
                          </tr>
                        ) : recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              Henüz sipariş bulunmuyor
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((order) => (
                            <tr key={order._id}>
                              <td className="px-4 py-3 text-sm">
                                {order.invoiceNumber || `#${order._id.slice(-6)}`}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {order.userId?.name || 'Bilinmeyen Kullanıcı'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                ₺{order.totalPrice?.toLocaleString('tr-TR') || '0'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  order.status === 'delivered'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : order.status === 'shipped'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : order.status === 'processing'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                }`}>
                                  {order.status === 'delivered' && 'Teslim Edildi'}
                                  {order.status === 'shipped' && 'Kargoda'}
                                  {order.status === 'processing' && 'Hazırlanıyor'}
                                  {order.status === 'pending' && 'Beklemede'}
                                  {order.status === 'cancelled' && 'İptal Edildi'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Hızlı İşlemler</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center justify-center"
                    >
                      <FiPlusCircle className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Ürün Ekle</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('lotteries')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center justify-center"
                    >
                      <FiGift className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Çekiliş Ekle</span>
                    </button>
                    <button
                      onClick={() => window.open('/', '_blank')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center justify-center"
                    >
                      <FiGlobe className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Site Önizleme</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('auctions')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center justify-center"
                    >
                      <FiDollarSign className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Açık Artırma</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center justify-center"
                    >
                      <FiAlertCircle className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Sistem Durumu</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <ProductManagement />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <CategoryManagement />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <UserManagement />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <OrderManagement />
            </div>
          )}

          {activeTab === 'auctions' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <AuctionManagement />
            </div>
          )}

          {activeTab === 'lotteries' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <LotteryManagement />
            </div>
          )}

          {activeTab === 'lottery-tickets' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <AdminLotteryTickets />
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <CompanyManagement />
            </div>
          )}

          {activeTab === 'exchange' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <AdminExchangeManagement />
            </div>
          )}

          {activeTab === 'dynamic-pricing' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <DynamicPricingManagement />
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <BannerManagement />
            </div>
          )}

          {activeTab === 'site-settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <SiteSettingsManagement />
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'categories' && activeTab !== 'users' && activeTab !== 'orders' && activeTab !== 'auctions' && activeTab !== 'lotteries' && activeTab !== 'companies' && activeTab !== 'exchange' && activeTab !== 'dynamic-pricing' && activeTab !== 'banners' && activeTab !== 'site-settings' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Bu bölüm henüz yapım aşamasında. Yakında burada olacak!
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md"
                  >
                    Ana Sayfaya Dön
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}



