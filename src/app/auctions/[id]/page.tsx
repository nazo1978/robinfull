'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowLeft, FiClock, FiTag, FiUser, FiBarChart2 } from 'react-icons/fi'
import Countdown from '@/components/Countdown'
import SafeImage from '@/components/SafeImage'

interface Bid {
  userId: string
  amount: number
  timestamp: string
}

interface Auction {
  _id: string
  productId: {
    _id: string
    name: string
    images: string[]
    description: string
    category: string
  }
  startPrice: number
  currentPrice: number
  minIncrement: number
  startTime: string
  endTime: string
  status: string
  bids: Bid[]
  highestBidder?: {
    _id: string
    name: string
  }
}

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAuction = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/auctions/${resolvedParams.id}`)
        if (!response.ok) throw new Error('Açık artırma detayları yüklenirken bir hata oluştu')
        const data = await response.json()
        setAuction(data.auction)

        // Minimum teklif miktarını ayarla
        if (data.auction) {
          const minAmount = data.auction.currentPrice + (data.auction.minIncrement || 1)
          setBidAmount(minAmount.toString())
        }
      } catch (err) {
        console.error('Açık artırma detayları çekilirken hata:', err)
        setError('Açık artırma detayları yüklenirken bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCurrentUser = async () => {
      try {
        // Cookie'den kullanıcı bilgilerini al
        const userDataCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='));

        if (userDataCookie) {
          const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
          setUser(userData);
          return;
        }

        // Cookie yoksa localStorage'dan kontrol et (fallback) - sadece client-side'da
        if (typeof window !== 'undefined') {
          try {
            const localUserData = localStorage.getItem('user');
            if (localUserData) {
              setUser(JSON.parse(localUserData));
              return;
            }

            // Admin kontrolü
            const adminData = localStorage.getItem('admin');
            if (adminData) {
              const admin = JSON.parse(adminData);
              setUser({
                _id: admin._id || admin.id,
                name: admin.name,
                email: admin.email,
                username: admin.username,
                role: 'admin'
              });
            }
          } catch (storageError) {
            console.warn('localStorage erişim hatası:', storageError);
          }
        }
      } catch (err) {
        console.error('Kullanıcı bilgileri çekilirken hata:', err)
      }
    }

    fetchAuction()
    fetchCurrentUser()
  }, [resolvedParams.id])

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/auctions/${resolvedParams.id}`))
      return
    }

    // Client-side validation
    const bidAmountNum = parseFloat(bidAmount)
    const minimumBid = auction.currentPrice + (auction.minIncrement || 1)

    if (bidAmountNum < minimumBid) {
      setError(`Teklif en az ${minimumBid.toLocaleString()} ₺ olmalıdır`)
      return
    }

    if (isUserHighestBidder()) {
      setError('Zaten en yüksek teklifi siz verdiniz')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Token'ı cookie'den al
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      console.log('Cookie\'den alınan token:', token ? `${token.substring(0, 20)}...` : 'Token yok');
      console.log('Tüm cookie\'ler:', document.cookie);

      const response = await fetch(`/api/auctions/${resolvedParams.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(bidAmount)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Teklif verme işlemi başarısız oldu')
      }

      setSuccessMessage('Teklifiniz başarıyla kaydedildi!')

      // Açık artırma verilerini yenile
      const auctionResponse = await fetch(`/api/auctions/${resolvedParams.id}`)
      const auctionData = await auctionResponse.json()
      setAuction(auctionData.auction)

      // Minimum teklif miktarını güncelle
      if (auctionData.auction) {
        const minAmount = auctionData.auction.currentPrice + (auctionData.auction.minIncrement || 1)
        setBidAmount(minAmount.toString())
      }
    } catch (err: any) {
      console.error('Teklif verme hatası:', err)
      setError(err.message || 'Teklif verme işlemi sırasında bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isAuctionActive = () => {
    if (!auction) return false
    return auction.status === 'active'
  }

  const isUserHighestBidder = () => {
    if (!auction || !user) return false
    return auction.highestBidder?._id === user._id
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      </div>
    )
  }

  if (error || !auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl text-red-600">{error || 'Açık artırma bulunamadı'}</p>
          <Link
            href="/auctions"
            className="mt-4 inline-block bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-500 py-2 px-6 rounded-lg transition-colors"
          >
            Açık Artırmalara Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/auctions"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Açık Artırmalara Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Ürün Görseli */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative h-80 md:h-96 w-full bg-gray-50 dark:bg-gray-700">
              <SafeImage
                src={auction.productId.images}
                alt={auction.productId.name}
                fill
                className="object-contain p-4"
                fallbackText="Resim yok"
              />
              {/* Açık Artırma Badge'i */}
              <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                Açık Artırma
              </div>
              {/* Durum Badge'i */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-md text-sm font-semibold ${
                auction.status === 'active'
                  ? 'bg-green-500 text-white'
                  : auction.status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {auction.status === 'active' ? 'Aktif' :
                 auction.status === 'pending' ? 'Beklemede' : 'Sona Erdi'}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Ürün Açıklaması</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {auction.productId.description || 'Bu ürün için açıklama bulunmamaktadır.'}
            </p>
          </div>

          {auction.bids && auction.bids.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Teklif Geçmişi</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Teklif
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {[...auction.bids]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((bid, index) => (
                        <tr key={index} className={index === 0 ? 'bg-green-50 dark:bg-green-900/30' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(bid.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {bid.userName || bid.userId?.name || bid.userId?.username || 'Anonim'}
                            {index === 0 && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                En Yüksek
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {bid.amount.toLocaleString('tr-TR')} ₺
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sağ Kolon - Teklif Bilgileri ve Formu */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
            <div className="mb-4">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                {auction.productId.category || 'Belirtilmemiş'}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white line-clamp-2">
              {auction.productId.name}
            </h1>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Mevcut Teklif</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {auction.currentPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Minimum Artış</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    +{(auction.minIncrement || 1).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">En Yüksek Teklif</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {auction.highestBidder ?
                    (auction.highestBidder.name || auction.highestBidder.username || 'Anonim') :
                    'Henüz teklif yok'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Kalan Süre</span>
                </div>
                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                  <Countdown targetDate={new Date(auction.endTime)} compact={false} />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Başlangıç: {formatDate(auction.startTime)}</div>
                  <div>Bitiş: {formatDate(auction.endTime)}</div>
                </div>
              </div>
            </div>

            {isAuctionActive() ? (
              <div>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
                    {successMessage}
                  </div>
                )}

                {isUserHighestBidder() ? (
                  <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md">
                    Şu anda en yüksek teklifi veren sizsiniz!
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit}>
                    <div className="mb-4">
                      <label htmlFor="bidAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                        Teklif Miktarı (₺)
                      </label>
                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={auction.currentPrice + (auction.minIncrement || 1)}
                        step="1"
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Minimum teklif: {(auction.currentPrice + (auction.minIncrement || 1)).toLocaleString()} ₺
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !user}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex justify-center items-center ${
                        (isSubmitting || !user)
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-500'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                          İşleniyor...
                        </>
                      ) : !user ? (
                        'Teklif vermek için giriş yapın'
                      ) : (
                        'Teklif Ver'
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                {auction.status === 'pending' ?
                  'Bu açık artırma henüz başlamamıştır.' :
                  'Bu açık artırma sona ermiştir.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}