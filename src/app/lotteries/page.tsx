'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiGift, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';
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
  lotteryCard: {
    numbers: string[];
    generatedAt: string;
  };
  stats: {
    totalTicketsSold: number;
    totalRevenue: number;
    participantCount: number;
  };
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function LotteriesPage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchLotteries();
  }, [filter]);

  const fetchLotteries = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const url = `http://localhost:5000/api/lotteries${statusParam}`;
      console.log('Çekiliş API çağrısı:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error('Çekilişler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      console.log('Çekiliş verileri:', data);
      setLotteries(data.lotteries || []);
    } catch (err: any) {
      console.error('Çekiliş hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLotteryActive = (lottery: Lottery) => {
    const now = new Date();
    const startDate = new Date(lottery.startDate);
    const endDate = new Date(lottery.endDate);
    return lottery.status === 'active' && now >= startDate && now <= endDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchLotteries}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎲 Çekilişler
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Şansınızı deneyin! Harika ödüller kazanma fırsatını kaçırmayın.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
            {[
              { key: 'all', label: 'Tümü' },
              { key: 'active', label: 'Aktif' },
              { key: 'completed', label: 'Tamamlanan' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lotteries Grid */}
        {lotteries.length === 0 ? (
          <div className="text-center py-12">
            <FiGift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz çekiliş bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yeni çekilişler için takipte kalın!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotteries.map((lottery) => (
              <div
                key={lottery._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Prize Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {lottery.prizeImage?.url ? (
                    <img
                      src={lottery.prizeImage.url}
                      alt={lottery.prizeImage.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FiGift className="h-16 w-16 text-white" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(lottery.status)}
                  </div>

                  {/* Active Badge */}
                  {isLotteryActive(lottery) && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      CANLI
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 uppercase">
                    {formatTitle(lottery.title)}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {formatDescription(lottery.description)}
                  </p>

                  {/* Prize */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <FiGift className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                        {lottery.prize}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FiUsers className="h-4 w-4 text-gray-500 mr-1" />
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {lottery.stats.participantCount}
                      </div>
                      <div className="text-xs text-gray-500">Katılımcı</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FiTrendingUp className="h-4 w-4 text-gray-500 mr-1" />
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {lottery.stats.totalTicketsSold}
                      </div>
                      <div className="text-xs text-gray-500">Bilet</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <FiClock className="h-4 w-4 mr-2" />
                      <span>Çekiliş: {formatDate(lottery.drawDate)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/lotteries/${lottery._id}`}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-center block transition-colors ${
                      isLotteryActive(lottery)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : lottery.status === 'completed'
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLotteryActive(lottery)
                      ? `Bilet Al (${lottery.ticketPrice} ₺)`
                      : lottery.status === 'completed'
                      ? 'Sonuçları Gör'
                      : 'Yakında'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
