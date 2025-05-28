'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiClock, FiUsers, FiArrowRight, FiGift, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/shared/context/AuthContext';

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
  stats: {
    totalTicketsSold: number;
    totalRevenue: number;
    participantCount: number;
  };
}

export default function LotteryHighlight() {
  const [activeLotteries, setActiveLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Yardımcı fonksiyon
  const isLotteryActive = (lottery: Lottery) => {
    const now = new Date();
    const startDate = new Date(lottery.startDate);
    const endDate = new Date(lottery.endDate);
    return lottery.status === 'active' && now >= startDate && now <= endDate;
  };

  useEffect(() => {
    fetchActiveLotteries();
  }, []);

  // Otomatik geçiş için useEffect
  useEffect(() => {
    const filteredLotteries = activeLotteries.filter(isLotteryActive);

    if (filteredLotteries.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= filteredLotteries.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // 5 saniye

      return () => clearInterval(interval);
    }
  }, [activeLotteries]);

  // currentIndex'in sınırları aşmaması için kontrol
  useEffect(() => {
    const filteredLotteries = activeLotteries.filter(isLotteryActive);
    if (currentIndex >= filteredLotteries.length && filteredLotteries.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeLotteries, currentIndex]);

  const fetchActiveLotteries = async () => {
    try {
      setLoading(true);
      const url = 'http://localhost:5000/api/lotteries?status=active&limit=10';
      console.log('Ana sayfa çekiliş API çağrısı:', url);

      const response = await fetch(url);
      console.log('Ana sayfa response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Ana sayfa çekiliş verileri:', data);
        setActiveLotteries(data.lotteries || []);
      } else {
        console.error('Ana sayfa API hatası:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Aktif çekilişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Süresi doldu';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} gün ${hours} saat`;
    if (hours > 0) return `${hours} saat ${minutes} dakika`;
    return `${minutes} dakika`;
  };



  // Aktif çekilişleri filtrele ve sırala
  const filteredLotteries = activeLotteries
    .filter(isLotteryActive)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  // Mevcut çekilişi seç
  const featuredLottery = filteredLotteries[currentIndex] || filteredLotteries[0];

  // Navigasyon fonksiyonları
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? filteredLotteries.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === filteredLotteries.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Çekiliş silme fonksiyonu
  const handleDeleteLottery = async (lotteryId: string) => {
    if (!isAdmin) return;

    const confirmDelete = window.confirm('Bu çekilişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
    if (!confirmDelete) return;

    try {
      setDeleteLoading(lotteryId);

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      const response = await fetch(`http://localhost:5000/api/lotteries/${lotteryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Çekilişi listeden kaldır
        setActiveLotteries(prev => prev.filter(lottery => lottery._id !== lotteryId));

        // Eğer silinen çekiliş mevcut gösterilen çekilişse, index'i ayarla
        const filteredLotteries = activeLotteries.filter(lottery => lottery._id !== lotteryId);
        if (currentIndex >= filteredLotteries.length && filteredLotteries.length > 0) {
          setCurrentIndex(0);
        }

        alert('Çekiliş başarıyla silindi.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Çekiliş silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Çekiliş silme hatası:', error);
      alert('Çekiliş silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredLottery) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-800 dark:text-white">🎲 Çekilişler</h2>

          <div className="text-center py-12">
            <FiGift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Şu anda aktif çekiliş bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Yeni çekilişler için takipte kalın!
            </p>
            <Link
              href="/lotteries"
              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Tüm Çekilişleri Gör <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center mb-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            🎲 Aktif Çekilişler
            {filteredLotteries.length > 1 && (
              <span className="text-lg font-normal text-gray-600 dark:text-gray-300 ml-2">
                ({currentIndex + 1}/{filteredLotteries.length})
              </span>
            )}
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden relative">
          {/* Navigasyon Okları */}
          {filteredLotteries.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 text-white transition-all z-20 backdrop-blur-sm"
                aria-label="Önceki çekiliş"
              >
                <FiChevronLeft size={24} />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 text-white transition-all z-20 backdrop-blur-sm"
                aria-label="Sonraki çekiliş"
              >
                <FiChevronRight size={24} />
              </button>
            </>
          )}

          <div className="md:flex">
            <div className="md:w-1/2 relative h-64 md:h-auto bg-gradient-to-br from-purple-500 to-blue-600">
              {featuredLottery.prizeImage?.url ? (
                <img
                  src={featuredLottery.prizeImage.url}
                  alt={featuredLottery.prizeImage.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FiGift className="h-24 w-24 text-white" />
                </div>
              )}

              {/* Active Badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                CANLI
              </div>

              {/* Admin Kontrolleri */}
              {isAdmin && (
                <div className="absolute top-4 left-4 flex gap-2">
                  <Link
                    href={`/admin/lotteries/edit/${featuredLottery._id}`}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-lg"
                    title="Çekilişi Düzenle"
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDeleteLottery(featuredLottery._id)}
                    disabled={deleteLoading === featuredLottery._id}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg disabled:opacity-50"
                    title="Çekilişi Sil"
                  >
                    {deleteLoading === featuredLottery._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {featuredLottery.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {featuredLottery.description}
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-6">
                  <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">🏆 Çekiliş Ödülü</h4>
                  <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                    {featuredLottery.prize}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <FiClock className="h-5 w-5 text-orange-500 mr-1" />
                    </div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {formatTimeRemaining(featuredLottery.endDate)}
                    </div>
                    <div className="text-xs text-gray-500">Kalan Süre</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <FiUsers className="h-5 w-5 text-blue-500 mr-1" />
                    </div>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {featuredLottery.stats.participantCount}
                    </div>
                    <div className="text-xs text-gray-500">Katılımcı</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/lotteries/${featuredLottery._id}`}
                  className="w-full inline-flex items-center justify-center bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Bilet Al ({featuredLottery.ticketPrice} ₺) <FiArrowRight className="ml-2" />
                </Link>

                <Link
                  href="/lotteries"
                  className="w-full inline-flex items-center justify-center border border-purple-600 text-purple-600 dark:text-purple-400 px-6 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Tüm Çekilişleri Gör
                </Link>
              </div>
            </div>
          </div>

          {/* Nokta İndikatörleri */}
          {filteredLotteries.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {filteredLotteries.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-white scale-125'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75 hover:scale-110'
                  }`}
                  aria-label={`Çekiliş ${index + 1}'e git`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Çekiliş Sayısı Göstergesi */}
        {filteredLotteries.length > 1 && (
          <div className="text-center mt-6">
            <span className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              {currentIndex + 1} / {filteredLotteries.length} aktif çekiliş
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
