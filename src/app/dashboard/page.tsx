'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiShoppingBag, FiHeart, FiUser, FiSettings, FiLogOut, FiCreditCard, FiTruck, FiGift } from 'react-icons/fi'
import { useAuth } from '@/shared/context/AuthContext'
import UserLotteryTickets from '@/components/user/UserLotteryTickets'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [userLotteryStats, setUserLotteryStats] = useState({
    totalTickets: 0,
    totalSpent: 0,
    totalWinnings: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/dashboard'))
    } else {
      // Kullanıcının rolüne göre yönlendirme yap
      if (user.role === 'seller') {
        router.push('/seller/dashboard')
        return
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard')
        return
      }
      // Normal kullanıcı için dashboard'da kal
      setIsLoading(false)
      fetchUserLotteryStats()
    }
  }, [user, router])

  const getAuthToken = () => {
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authTokenCookie ? authTokenCookie.split('=')[1] : null;
  };

  const fetchUserLotteryStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('/api/user/lottery-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const lotteries = data.lotteryTickets || [];

        const stats = lotteries.reduce((acc, lottery) => {
          const totalTickets = lottery.userTickets.length;
          const totalSpent = totalTickets * lottery.ticketPrice;
          const totalWinnings = lottery.userTickets.reduce((sum, ticket) => {
            if (lottery.results?.winners) {
              const winner = lottery.results.winners.find(w => w.ticketNumber === ticket.ticketNumber);
              if (winner) {
                const prizeValue = parseFloat(winner.prize.replace(/[^\d.]/g, '')) || 0;
                return sum + prizeValue;
              }
            }
            return sum;
          }, 0);

          return {
            totalTickets: acc.totalTickets + totalTickets,
            totalSpent: acc.totalSpent + totalSpent,
            totalWinnings: acc.totalWinnings + totalWinnings
          };
        }, { totalTickets: 0, totalSpent: 0, totalWinnings: 0 });

        setUserLotteryStats(stats);
      }
    } catch (error) {
      console.error('Kullanıcı çekiliş istatistikleri yüklenirken hata:', error);
    }
  };

  const handleLogout = () => {
    logout()
    router.push('/')
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
    { id: 'orders', label: 'Siparişlerim', icon: FiShoppingBag },
    { id: 'lottery-tickets', label: 'Çekiliş Biletlerim', icon: FiGift },
    { id: 'favorites', label: 'Favorilerim', icon: FiHeart },
    { id: 'profile', label: 'Profilim', icon: FiUser },
    { id: 'payments', label: 'Ödeme Yöntemlerim', icon: FiCreditCard },
    { id: 'addresses', label: 'Adreslerim', icon: FiTruck },
    { id: 'settings', label: 'Ayarlar', icon: FiSettings },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="auto-card rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FiUser size={40} className="opacity-50" />
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>

            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full text-left py-2 px-3 rounded-lg flex items-center transition ${
                    activeTab === tab.id
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="mr-3" />
                  {tab.label}
                </button>
              ))}

              <button
                className="w-full text-left py-2 px-3 mt-6 rounded-lg flex items-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <FiLogOut className="mr-3" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="auto-card rounded-lg p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Genel Bakış</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Toplam Sipariş</h3>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Aktif Teklifler</h3>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Çekiliş Biletleri</h3>
                    <p className="text-2xl font-bold">{userLotteryStats.totalTickets}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold mb-1">Kupon Puanları</h3>
                    <p className="text-2xl font-bold">250</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4">Son Siparişler</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 text-left">Sipariş No</th>
                        <th className="py-3 text-left">Tarih</th>
                        <th className="py-3 text-left">Tutar</th>
                        <th className="py-3 text-left">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3">#2024001</td>
                        <td className="py-3">12.06.2024</td>
                        <td className="py-3">1.234 ₺</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Tamamlandı
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3">#2024002</td>
                        <td className="py-3">24.05.2024</td>
                        <td className="py-3">867 ₺</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Kargoya Verildi
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3">#2024003</td>
                        <td className="py-3">15.04.2024</td>
                        <td className="py-3">523 ₺</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Tamamlandı
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-right">
                  <button className="text-blue-600 hover:underline" onClick={() => setActiveTab('orders')}>
                    Tüm siparişleri gör
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profil Bilgilerim</h2>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full py-2 px-4 rounded-lg"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full py-2 px-4 rounded-lg"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Telefon</label>
                      <input
                        type="tel"
                        className="w-full py-2 px-4 rounded-lg"
                        placeholder="Telefon numarası ekleyin"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Doğum Tarihi</label>
                      <input
                        type="date"
                        className="w-full py-2 px-4 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Siparişlerim</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Tüm siparişlerinizi detaylı olarak görüntülemek için aşağıdaki butona tıklayın.
                </p>
                <Link
                  href="/dashboard/orders"
                  className="inline-block bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Siparişlerimi Görüntüle
                </Link>
              </div>
            )}

            {activeTab === 'lottery-tickets' && (
              <UserLotteryTickets />
            )}

            {/* Diğer tablar buraya eklenebilir */}
            {activeTab !== 'overview' && activeTab !== 'profile' && activeTab !== 'orders' && activeTab !== 'lottery-tickets' && (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Bu bölüm henüz yapım aşamasında. Yakında burada olacak!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}