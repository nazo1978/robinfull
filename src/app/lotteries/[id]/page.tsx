'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiGift, FiClock, FiUsers, FiTrendingUp, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/shared/context/AuthContext';
import { formatTitle, formatDescription } from '@/utils/textFormatting';


interface Lottery {
  _id: string;
  title: string;
  description: string;
  prize: string;
  prizeImage?: {
    url: string;
    alt: string;
  };
  ticketPrice: number;
  startDate: string;
  endDate: string;
  drawDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  lotteryConfig?: {
    numbersPerTicket: number;
    totalTickets: number;
    minParticipants: number;
    allowCustomNumbers: boolean;
    maxTicketsPerUser: number;
  };
  tickets?: Array<{
    userId: string;
    username: string;
    numbers: string[];
    purchaseDate: string;
    ticketNumber: string;
    ticketId: string;
    isCustomNumbers: boolean;
  }>;
  availableTickets?: Array<{
    ticketId: string;
    numbers: string[];
    isAvailable: boolean;
    soldTo?: string;
    soldAt?: string;
  }>;
  stats: {
    totalTicketsSold: number;
    totalRevenue: number;
    participantCount: number;
  };
  results?: {
    winningNumbers: string[];
    winners: Array<{
      userId: string;
      ticketNumber: string;
      matchedNumbers: string[];
      prize: string;
    }>;
    drawnAt: string;
    drawnBy: string;
  };
}

export default function LotteryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [lottery, setLottery] = useState<Lottery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [availableTicketsCount, setAvailableTicketsCount] = useState<number | null>(null);


  useEffect(() => {
    if (id) {
      fetchLottery();
    }
  }, [id]);



  const fetchLottery = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/lotteries/${id}`);

      if (!response.ok) {
        throw new Error('Çekiliş yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setLottery(data.lottery);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handlePurchaseTicket = async () => {
    if (!user) {
      alert('Bilet satın almak için giriş yapmalısınız');
      return;
    }

    // Kullanıcının kaç bilet aldığını kontrol et
    const userTickets = lottery?.tickets?.filter(ticket => ticket.userId === user.id) || [];
    const maxTickets = lottery?.lotteryConfig?.maxTicketsPerUser || 10;

    if (userTickets.length >= maxTickets) {
      alert(`Bu çekilişten en fazla ${maxTickets} bilet satın alabilirsiniz`);
      return;
    }

    try {
      setPurchasing(true);

      // Auth token'ı al
      const getAuthToken = () => {
        // Önce user objesinden token'ı almayı dene
        if (user && user.token) {
          return user.token;
        }

        // Cookie'den token almayı dene
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split(';');
          for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'authToken' && value) {
              return decodeURIComponent(value);
            }
          }
        }

        // localStorage'dan almayı dene
        if (typeof window !== 'undefined') {
          const localToken = localStorage.getItem('authToken');
          if (localToken) {
            return localToken;
          }

          // sessionStorage'dan almayı dene
          const sessionToken = sessionStorage.getItem('authToken');
          if (sessionToken) {
            return sessionToken;
          }
        }

        return null;
      };

      const token = getAuthToken();

      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/lotteries/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        // Başarı mesajı göster
        const message = `🎉 Bilet başarıyla satın alındı!\n\n` +
                       `🎫 Bilet Numaranız: ${data.ticket.ticketNumber}\n\n` +
                       `🔢 Seçilen Sayılar:\n${data.ticket.numbers.join(' - ')}\n\n` +
                       `📊 Kalan Bilet: ${data.availableTicketsCount}`;

        alert(message);

        // State'leri güncelle
        setAvailableTicketsCount(data.availableTicketsCount);

        // Çekiliş bilgilerini yenile
        fetchLottery();
      } else {
        alert(data.message || 'Bilet satın alınırken bir hata oluştu');
      }
    } catch (err: any) {
      alert('Bilet satın alınırken bir hata oluştu');
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLotteryActive = () => {
    if (!lottery) return false;
    const now = new Date();
    const startDate = new Date(lottery.startDate);
    const endDate = new Date(lottery.endDate);
    return lottery.status === 'active' && now >= startDate && now <= endDate;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const labels = {
      pending: 'Beklemede',
      active: 'Aktif',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !lottery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Çekiliş bulunamadı'}</p>
          <Link
            href="/lotteries"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Çekilişlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/lotteries"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Çekilişlere Dön
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Çekiliş Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prize Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600">
                {lottery.prizeImage?.url ? (
                  <img
                    src={lottery.prizeImage.url}
                    alt={lottery.prizeImage.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiGift className="h-24 w-24 text-white" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {getStatusBadge(lottery.status)}
                </div>

                {/* Active Badge */}
                {isLotteryActive() && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    CANLI
                  </div>
                )}
              </div>
            </div>

            {/* Lottery Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 uppercase">
                {formatTitle(lottery.title)}
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {formatDescription(lottery.description)}
              </p>

              {/* Prize */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <FiGift className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-lg">
                      Ödül
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      {lottery.prize}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <FiUsers className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lottery.stats.participantCount}
                  </div>
                  <div className="text-sm text-gray-500">Katılımcı</div>
                </div>
                <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <FiTrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lottery.stats.totalTicketsSold}
                  </div>
                  <div className="text-sm text-gray-500">Bilet</div>
                </div>
                <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <FiClock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatDate(lottery.drawDate)}
                  </div>
                  <div className="text-sm text-gray-500">Çekiliş</div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Başlangıç:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatDate(lottery.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bitiş:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatDate(lottery.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results (if completed) */}
            {lottery.status === 'completed' && lottery.results && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  🎉 Çekiliş Sonuçları
                </h2>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Kazanan Sayılar:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lottery.results.winningNumbers.map((number, index) => (
                      <span
                        key={index}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg"
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                </div>

                {lottery.results.winners.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Kazananlar:
                    </h3>
                    <div className="space-y-2">
                      {lottery.results.winners.map((winner, index) => (
                        <div
                          key={index}
                          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">
                                🏆 {winner.username || 'Anonim Kullanıcı'}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Bilet: {winner.ticketNumber}
                              </span>
                            </div>
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              {winner.prize}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Eşleşen sayılar: {winner.matchedNumbers.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sağ Kolon - Çekiliş Kartı ve Bilet Alma */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🎲 Çekiliş Kartı
              </h2>

              <div className="text-center mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Bu çekilişte her bilet {lottery.lotteryConfig?.numbersPerTicket || 12} adet benzersiz sayı içerir.
                </p>
                {availableTicketsCount !== null && (
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-4">
                    Kalan bilet sayısı: {availableTicketsCount}
                  </p>
                )}
              </div>

              {/* Bilet Bilgisi */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    🎲 Otomatik Bilet Sistemi
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-300">
                    Bilet satın aldığınızda size otomatik olarak {lottery.lotteryConfig?.numbersPerTicket || 12} adet benzersiz sayı atanacaktır
                  </p>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Bilet Fiyatı:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lottery.ticketPrice} ₺
                  </span>
                </div>
              </div>

              {/* User's Tickets */}
              {user && lottery.tickets && lottery.tickets.length > 0 && (
                <div className="mb-4">
                  {(() => {
                    const userTickets = lottery.tickets.filter(ticket => ticket.userId === user.id);
                    const maxTickets = lottery.lotteryConfig?.maxTicketsPerUser || 10;

                    return (
                      <>
                        <div className="text-center mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Biletleriniz ({userTickets.length}/{maxTickets})
                          </p>
                        </div>
                        {userTickets.map((ticket, index) => (
                      <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">
                            ✅ Biletiniz Alındı
                          </span>
                          <span className="text-xs text-green-600 dark:text-green-400">
                            {ticket.ticketNumber}
                          </span>
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          Sayılar: {ticket.numbers.join(' - ')}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {ticket.isCustomNumbers ? '🎯 Özel Seçim' : '🎲 Otomatik'} • {new Date(ticket.purchaseDate).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Purchase Button */}
              {isLotteryActive() ? (
                (() => {
                  const userTickets = lottery.tickets?.filter(ticket => ticket.userId === user?.id) || [];
                  const maxTickets = lottery.lotteryConfig?.maxTicketsPerUser || 10;
                  const canBuyMore = userTickets.length < maxTickets;

                  return (
                    <button
                      onClick={handlePurchaseTicket}
                      disabled={purchasing || !user || !canBuyMore}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        purchasing || !user || !canBuyMore
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      }`}
                    >
                      {purchasing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          İşleniyor...
                        </div>
                      ) : !user ? (
                        'Giriş Yapın'
                      ) : !canBuyMore ? (
                        `✅ Maksimum Bilet Alındı (${userTickets.length}/${maxTickets})`
                      ) : (
                        `🎲 Bilet Al (${lottery.ticketPrice} ₺)`
                      )}
                    </button>
                  );
                })()
              ) : (
                <div className="text-center py-3 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">
                    {lottery.status === 'completed' ? 'Çekiliş Tamamlandı' : 'Çekiliş Aktif Değil'}
                  </span>
                </div>
              )}

              {!user && isLotteryActive() && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Bilet satın almak için{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700">
                    giriş yapın
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
