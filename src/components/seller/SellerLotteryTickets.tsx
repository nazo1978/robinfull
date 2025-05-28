'use client';

import React, { useState, useEffect } from 'react';
import { FiGift, FiCalendar, FiUsers, FiTrendingUp, FiEye, FiRefreshCw, FiSearch } from 'react-icons/fi';
import Link from 'next/link';

interface LotteryTicketData {
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
    maxTicketsPerUser: number;
  };
  tickets: Array<{
    userId: string;
    username: string;
    ticketNumber: string;
    numbers: string[];
    purchaseDate: string;
    isCustomNumbers: boolean;
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
      username: string;
      ticketNumber: string;
      prize: string;
    }>;
    drawnAt: string;
  };
}

export default function SellerLotteryTickets() {
  const [lotteries, setLotteries] = useState<LotteryTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLottery, setSelectedLottery] = useState<string | null>(null);

  useEffect(() => {
    fetchAllLotteryTickets();
  }, []);

  const getAuthToken = () => {
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authTokenCookie ? authTokenCookie.split('=')[1] : null;
  };

  const fetchAllLotteryTickets = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor');
      }

      const response = await fetch('/api/seller/lottery-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Çekiliş biletleri yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setLotteries(data.lotteries || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredLotteries = lotteries.filter(lottery =>
    lottery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lottery.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = lotteries.reduce((acc, lottery) => ({
    totalTickets: acc.totalTickets + lottery.stats.totalTicketsSold,
    totalRevenue: acc.totalRevenue + lottery.stats.totalRevenue,
    totalParticipants: acc.totalParticipants + lottery.stats.participantCount,
    totalLotteries: acc.totalLotteries + 1
  }), { totalTickets: 0, totalRevenue: 0, totalParticipants: 0, totalLotteries: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchAllLotteryTickets}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Çekiliş Biletlerim
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Satın aldığınız çekiliş biletlerinizi görüntüleyin
          </p>
        </div>
        <button
          onClick={fetchAllLotteryTickets}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <FiGift className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Katıldığım Çekiliş</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalStats.totalLotteries}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <FiTrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Aldığım Bilet</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{totalStats.totalTickets}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <FiTrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Toplam Harcama</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{totalStats.totalRevenue} ₺</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Çekiliş ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Lottery List */}
      {filteredLotteries.length === 0 ? (
        <div className="text-center py-12">
          <FiGift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Arama kriterlerine uygun çekiliş bulunamadı' : 'Henüz çekiliş biletiniz yok'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Farklı kriterler deneyin' : 'Çekilişlere katılarak şansınızı deneyin!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLotteries.map((lottery) => (
            <div key={lottery._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Lottery Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {lottery.title}
                      </h3>
                      {getStatusBadge(lottery.status)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {lottery.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Ödül:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{lottery.prize}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Bilet Fiyatı:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{lottery.ticketPrice} ₺</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Çekiliş Tarihi:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatDate(lottery.drawDate)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Satılan Bilet:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{lottery.stats.totalTicketsSold}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLottery(selectedLottery === lottery._id ? null : lottery._id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      {selectedLottery === lottery._id ? 'Gizle' : 'Biletleri Gör'}
                    </button>
                    <Link
                      href={`/lotteries/${lottery._id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Detay
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tickets Detail */}
              {selectedLottery === lottery._id && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Biletleriniz ({lottery.tickets.length})
                  </h4>

                  {lottery.tickets.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Henüz bilet satılmamış
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lottery.tickets.map((ticket, index) => {
                        const isWinner = lottery.results?.winners.some(w => w.ticketNumber === ticket.ticketNumber);
                        const winnerPrize = lottery.results?.winners.find(w => w.ticketNumber === ticket.ticketNumber)?.prize;

                        return (
                          <div
                            key={index}
                            className={`rounded-lg p-4 border-2 ${
                              isWinner
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {ticket.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  #{ticket.ticketNumber}
                                </p>
                              </div>
                              {isWinner && (
                                <div className="text-right">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    🎉 Kazandı!
                                  </span>
                                  <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                                    {winnerPrize}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sayılar:</p>
                              <div className="flex flex-wrap gap-1">
                                {ticket.numbers.map((number, numIndex) => (
                                  <span
                                    key={numIndex}
                                    className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                                      lottery.results?.winningNumbers.includes(number)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                    }`}
                                  >
                                    {number}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 dark:text-gray-400">
                                {formatDate(ticket.purchaseDate)}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {lottery.ticketPrice} ₺
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Winning Numbers (if completed) */}
                  {lottery.status === 'completed' && lottery.results && (
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h5 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        🎯 Kazanan Sayılar:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {lottery.results.winningNumbers.map((number, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg font-bold text-sm"
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                        Çekiliş Tarihi: {formatDate(lottery.results.drawnAt)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
