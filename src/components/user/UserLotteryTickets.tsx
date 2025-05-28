'use client';

import React, { useState, useEffect } from 'react';
import { FiGift, FiCalendar, FiClock, FiTrendingUp, FiEye, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

interface LotteryTicket {
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
  userTickets: Array<{
    ticketNumber: string;
    numbers: string[];
    purchaseDate: string;
    isCustomNumbers: boolean;
  }>;
  results?: {
    winningNumbers: string[];
    winners: Array<{
      ticketNumber: string;
      prize: string;
    }>;
    drawnAt: string;
  };
}

export default function UserLotteryTickets() {
  const [lotteryTickets, setLotteryTickets] = useState<LotteryTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchUserLotteryTickets();
  }, []);

  const getAuthToken = () => {
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    return authTokenCookie ? authTokenCookie.split('=')[1] : null;
  };

  const fetchUserLotteryTickets = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor');
      }

      const response = await fetch('/api/user/lottery-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Çekiliş biletleri yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setLotteryTickets(data.lotteryTickets || []);
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

  const isWinner = (lottery: LotteryTicket, ticketNumber: string) => {
    return lottery.results?.winners.some(winner => winner.ticketNumber === ticketNumber);
  };

  const getWinnerPrize = (lottery: LotteryTicket, ticketNumber: string) => {
    const winner = lottery.results?.winners.find(winner => winner.ticketNumber === ticketNumber);
    return winner?.prize;
  };

  const filteredTickets = lotteryTickets.filter(lottery => {
    if (filter === 'all') return true;
    if (filter === 'active') return lottery.status === 'active';
    if (filter === 'completed') return lottery.status === 'completed';
    return true;
  });

  const totalTickets = lotteryTickets.reduce((sum, lottery) => sum + lottery.userTickets.length, 0);
  const totalSpent = lotteryTickets.reduce((sum, lottery) => sum + (lottery.userTickets.length * lottery.ticketPrice), 0);
  const totalWinnings = lotteryTickets.reduce((sum, lottery) => {
    if (!lottery.results) return sum;
    return sum + lottery.userTickets.reduce((ticketSum, ticket) => {
      const prize = getWinnerPrize(lottery, ticket.ticketNumber);
      return ticketSum + (prize ? parseFloat(prize.replace(/[^\d.]/g, '')) || 0 : 0);
    }, 0);
  }, 0);

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
          onClick={fetchUserLotteryTickets}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Çekiliş Biletlerim
        </h2>
        <button
          onClick={fetchUserLotteryTickets}
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
              <p className="text-sm text-blue-600 dark:text-blue-400">Toplam Bilet</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{totalTickets}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <FiTrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Toplam Harcama</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{totalSpent} ₺</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <FiGift className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Toplam Kazanç</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{totalWinnings} ₺</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Tümü ({lotteryTickets.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Aktif ({lotteryTickets.filter(l => l.status === 'active').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Tamamlanan ({lotteryTickets.filter(l => l.status === 'completed').length})
        </button>
      </div>

      {/* Lottery Tickets */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <FiGift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'Henüz çekiliş biletiniz yok' : `${filter === 'active' ? 'Aktif' : 'Tamamlanan'} çekiliş biletiniz yok`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Çekilişlere katılarak şansınızı deneyin!
          </p>
          <Link
            href="/lotteries"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Çekilişleri Gör
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTickets.map((lottery) => (
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
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiGift className="w-4 h-4" />
                        <span>{lottery.prize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>Çekiliş: {formatDate(lottery.drawDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiGift className="w-4 h-4" />
                        <span>{lottery.userTickets.length} Bilet</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/lotteries/${lottery._id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                    Detay
                  </Link>
                </div>
              </div>

              {/* User Tickets */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Biletleriniz ({lottery.userTickets.length}/{lottery.lotteryConfig?.maxTicketsPerUser || 10})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lottery.userTickets.map((ticket, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-4 border-2 ${
                        isWinner(lottery, ticket.ticketNumber)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Bilet #{ticket.ticketNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(ticket.purchaseDate)}
                          </p>
                        </div>
                        {isWinner(lottery, ticket.ticketNumber) && (
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              🎉 Kazandı!
                            </span>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                              {getWinnerPrize(lottery, ticket.ticketNumber)}
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
                          🎲 Otomatik Seçim
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {lottery.ticketPrice} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
