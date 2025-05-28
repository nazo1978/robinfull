'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiHome, FiPackage, FiShoppingBag, FiDollarSign, FiSettings,
  FiLogOut, FiPlusCircle, FiBarChart2, FiUser, FiEye, FiClock, FiRefreshCw, FiGift
} from 'react-icons/fi'
import { useAuth } from '@/shared/context/AuthContext'
import SellerProductManagement from '@/components/seller/SellerProductManagement'
import SellerOrderManagement from '@/components/seller/SellerOrderManagement'
import SellerExchangeManagement from '@/components/seller/SellerExchangeManagement'
import SellerLotteryTickets from '@/components/seller/SellerLotteryTickets'

interface SellerUser {
  id: string
  name: string
  email: string
  role: string
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [lotteryStats, setLotteryStats] = useState({
    totalLotteries: 0,
    totalTickets: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/seller/dashboard'));
      return;
    }

    // Seller veya admin yetkisi kontrolü
    if (user.role !== 'seller' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
    fetchLotteryStats();
  }, [user, router])

  const getAuthToken = () => {
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authTokenCookie ? authTokenCookie.split('=')[1] : null;
  };

  const fetchLotteryStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('/api/seller/lottery-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const lotteries = data.lotteries || [];

        const stats = lotteries.reduce((acc, lottery) => ({
          totalLotteries: acc.totalLotteries + 1,
          totalTickets: acc.totalTickets + (lottery.stats?.totalTicketsSold || 0),
          totalRevenue: acc.totalRevenue + (lottery.stats?.totalRevenue || 0)
        }), { totalLotteries: 0, totalTickets: 0, totalRevenue: 0 });

        setLotteryStats(stats);
      }
    } catch (error) {
      console.error('Çekiliş istatistikleri yüklenirken hata:', error);
    }
  };

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

  if (!user) {
    return null // Router already redirecting
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: FiHome },
    { id: 'products', label: 'Ürünlerim', icon: FiPackage },
    { id: 'exchange', label: 'Takas Ürünlerim', icon: FiRefreshCw },
    { id: 'orders', label: 'Siparişlerim', icon: FiShoppingBag },
    { id: 'lottery-tickets', label: 'Çekiliş Biletlerim', icon: FiGift },
    { id: 'earnings', label: 'Kazançlarım', icon: FiDollarSign },
    { id: 'analytics', label: 'Analitik', icon: FiBarChart2 },
    { id: 'settings', label: 'Ayarlar', icon: FiSettings },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <FiUser className="h-8 w-8 text-black dark:text-white mr-2" />
            <h1 className="text-xl font-bold">Satıcı Paneli</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <FiUser className="text-gray-600 dark:text-gray-300" />
              </div>
              <div className="ml-3">
                <p className="font-medium">{user.name}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <FiPackage className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Ürün</p>
                      <p className="text-2xl font-semibold">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                      <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Onay Bekleyen</p>
                      <p className="text-2xl font-semibold">3</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <FiShoppingBag className="h-6 w-6 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aylık Satış</p>
                      <p className="text-2xl font-semibold">28</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <FiGift className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Çekiliş Biletlerim</p>
                      <p className="text-2xl font-semibold">{lotteryStats.totalTickets}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <FiDollarSign className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aylık Kazanç</p>
                      <p className="text-2xl font-semibold">₺8,450</p>
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
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <p className="font-medium">Sipariş #1234</p>
                        <p className="text-sm text-gray-500">iPhone 14 Pro</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₺32,999</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Tamamlandı</span>
                      </div>
                    </div>
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
                      onClick={() => setActiveTab('orders')}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col items-center justify-center"
                    >
                      <FiEye className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Siparişleri Gör</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <SellerProductManagement />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <SellerOrderManagement />
            </div>
          )}

          {activeTab === 'exchange' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <SellerExchangeManagement />
            </div>
          )}

          {activeTab === 'lottery-tickets' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <SellerLotteryTickets />
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'orders' && activeTab !== 'exchange' && activeTab !== 'lottery-tickets' && (
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
