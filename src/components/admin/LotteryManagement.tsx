'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiPlay, FiRefreshCw, FiGift, FiUsers, FiTrendingUp } from 'react-icons/fi';
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
  lotteryConfig?: {
    numbersPerTicket: number;
    totalTickets: number;
    minParticipants: number;
    allowCustomNumbers: boolean;
    maxTicketsPerUser: number;
  };
  lotteryCard?: {
    numbers: string[];
    generatedAt: string;
  };
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
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function LotteryManagement() {
  const { user } = useAuth();
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    prizeImageUrl: '',
    ticketPrice: '',
    startDate: '',
    endDate: '',
    drawDate: '',
    numbersPerTicket: 12,
    minParticipants: 10,
    allowCustomNumbers: false,
    maxTicketsPerUser: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Token alma fonksiyonu
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

  useEffect(() => {
    fetchLotteries();
  }, []);

  const fetchLotteries = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch('/api/admin/lotteries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Çekilişler yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setLotteries(data.lotteries || []);
    } catch (err: any) {
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

  const handleDrawLottery = async (lotteryId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      // Önce çekiliş uygunluğunu kontrol et
      const checkResponse = await fetch(`/api/admin/lotteries/${lotteryId}/check-draw`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const checkData = await checkResponse.json();

      if (!checkData.success) {
        alert(checkData.message || 'Çekiliş uygunluk kontrolü yapılırken bir hata oluştu');
        return;
      }

      const { eligibility } = checkData;

      if (!eligibility.canStart) {
        // Loading ekranı göster
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px;">
              <div style="margin-bottom: 1rem;">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
              </div>
              <h3 style="margin-bottom: 1rem; color: #333;">Çekiliş Bekleniyor</h3>
              <p style="color: #666; margin-bottom: 1rem;">${eligibility.message}</p>
              <p style="color: #666; font-size: 0.9em;">Yeterli katılımcı olduğunda çekiliş başlatılabilir.</p>
              <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Tamam</button>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
        document.body.appendChild(loadingDiv);
        return;
      }

      if (!confirm(`Çekiliş yapılacak. Bu işlem geri alınamaz. Emin misiniz?\n\nKatılımcı Sayısı: ${eligibility.currentParticipants}/${eligibility.requiredParticipants}`)) {
        return;
      }

      const response = await fetch(`/api/admin/lotteries/${lotteryId}/draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Çekiliş başarıyla tamamlandı!');
        fetchLotteries();
      } else {
        alert(data.message || 'Çekiliş yapılırken bir hata oluştu');
      }
    } catch (err: any) {
      alert('Çekiliş yapılırken bir hata oluştu');
    }
  };

  const handleRegenerateCard = async (lotteryId: string) => {
    if (!confirm('Çekiliş kartı yeniden oluşturulacak. Emin misiniz?')) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      const response = await fetch(`/api/admin/lotteries/${lotteryId}/regenerate-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Çekiliş kartı yeniden oluşturuldu!');
        fetchLotteries();
      } else {
        alert(data.message || 'Kart yeniden oluşturulurken bir hata oluştu');
      }
    } catch (err: any) {
      alert('Kart yeniden oluşturulurken bir hata oluştu');
    }
  };

  // Çekiliş silme fonksiyonu
  const handleDeleteLottery = async (lotteryId: string) => {
    const confirmDelete = window.confirm('Bu çekilişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.');
    if (!confirmDelete) return;

    try {
      setDeleteLoading(lotteryId);
      const token = getAuthToken();

      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/lotteries/${lotteryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Çekiliş başarıyla silindi.');
        fetchLotteries(); // Listeyi yenile
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prize: '',
      prizeImageUrl: '',
      ticketPrice: '',
      startDate: '',
      endDate: '',
      drawDate: '',
      numbersPerTicket: 12,
      minParticipants: 10,
      allowCustomNumbers: false,
      maxTicketsPerUser: 10
    });
    setShowCreateForm(false);
  };

  const handleEditLottery = (lottery: Lottery) => {
    // Yeni düzenleme sayfasına yönlendir
    window.open(`/admin/lotteries/edit/${lottery._id}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Form validasyonu
    if (!formData.title || !formData.description || !formData.prize || !formData.ticketPrice ||
        !formData.startDate || !formData.endDate || !formData.drawDate) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    // Tarih validasyonu
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const drawDate = new Date(formData.drawDate);
    const now = new Date();

    if (startDate < now) {
      alert('Başlangıç tarihi gelecekte olmalıdır');
      return;
    }

    if (endDate <= startDate) {
      alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    if (drawDate <= endDate) {
      alert('Çekiliş tarihi bitiş tarihinden sonra olmalıdır');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getAuthToken();

      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      const submitData = {
        title: formData.title,
        description: formData.description,
        prize: formData.prize,
        prizeImage: formData.prizeImageUrl ? {
          url: formData.prizeImageUrl,
          alt: formData.title
        } : undefined,
        ticketPrice: parseFloat(formData.ticketPrice),
        startDate: formData.startDate,
        endDate: formData.endDate,
        drawDate: formData.drawDate,
        status: 'pending',
        lotteryConfig: {
          numbersPerTicket: formData.numbersPerTicket,
          totalTickets: Math.floor(999 / formData.numbersPerTicket),
          minParticipants: formData.minParticipants,
          allowCustomNumbers: formData.allowCustomNumbers,
          maxTicketsPerUser: formData.maxTicketsPerUser
        }
      };

      const url = '/api/admin/lotteries';
      const method = 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Çekiliş başarıyla oluşturuldu!');
        resetForm();
        fetchLotteries();
      } else {
        alert(data.message || 'Çekiliş oluşturulurken bir hata oluştu');
      }
    } catch (err: any) {
      alert('Çekiliş oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchLotteries}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Çekiliş Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-300">Çekilişleri yönetin ve sonuçları görüntüleyin</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Yeni Çekiliş
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FiGift className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Çekiliş</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{lotteries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <FiPlay className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif Çekiliş</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {lotteries.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <FiUsers className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Katılımcı</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {lotteries.reduce((sum, l) => sum + l.stats.participantCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <FiTrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Gelir</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ₺{lotteries.reduce((sum, l) => sum + l.stats.totalRevenue, 0).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lotteries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Çekilişler</h2>
        </div>

        {lotteries.length === 0 ? (
          <div className="text-center py-12">
            <FiGift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz çekiliş bulunmuyor
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              İlk çekilişinizi oluşturmak için "Yeni Çekiliş" butonuna tıklayın.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Yeni Çekiliş Oluştur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Çekiliş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ödül
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Bilet Fiyatı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Katılımcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Çekiliş Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lotteries.map((lottery) => (
                  <tr key={lottery._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {lottery.prizeImage?.url ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={lottery.prizeImage.url}
                              alt={lottery.prizeImage.alt}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <FiGift className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {lottery.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {lottery.description.length > 50
                              ? `${lottery.description.substring(0, 50)}...`
                              : lottery.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{lottery.prize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lottery.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ₺{lottery.ticketPrice.toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {lottery.stats.participantCount}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {lottery.stats.totalTicketsSold} bilet
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(lottery.drawDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/lotteries/${lottery._id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Görüntüle"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>

                        {/* Düzenleme butonu - tüm durumlar için */}
                        <button
                          onClick={() => handleEditLottery(lottery)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Düzenle"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>

                        {lottery.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRegenerateCard(lottery._id)}
                              className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                              title="Kartı Yenile"
                            >
                              <FiRefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLottery(lottery._id)}
                              disabled={deleteLoading === lottery._id}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Sil"
                            >
                              {deleteLoading === lottery._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}

                        {lottery.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleDrawLottery(lottery._id)}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                              title="Çekiliş Yap"
                            >
                              <FiPlay className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLottery(lottery._id)}
                              disabled={deleteLoading === lottery._id}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                              title="Sil"
                            >
                              {deleteLoading === lottery._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}

                        {(lottery.status === 'completed' || lottery.status === 'cancelled') && (
                          <button
                            onClick={() => handleDeleteLottery(lottery._id)}
                            disabled={deleteLoading === lottery._id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            title="Sil"
                          >
                            {deleteLoading === lottery._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Yeni Çekiliş Oluştur
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Çekiliş Başlığı */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Çekiliş Başlığı *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Örn: iPhone 15 Pro Çekilişi"
                  />
                </div>

                {/* Açıklama */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Çekiliş hakkında detaylı bilgi..."
                  />
                </div>

                {/* Ödül */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ödül *
                  </label>
                  <input
                    type="text"
                    name="prize"
                    value={formData.prize}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Örn: iPhone 15 Pro 256GB"
                  />
                </div>

                {/* Bilet Fiyatı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bilet Fiyatı (₺) *
                  </label>
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="50"
                  />
                </div>

                {/* Ödül Resmi URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ödül Resmi URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    name="prizeImageUrl"
                    value={formData.prizeImageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Başlangıç Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Bitiş Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Çekiliş Tarihi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Çekiliş Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    name="drawDate"
                    value={formData.drawDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Çekiliş Konfigürasyonu */}
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Çekiliş Konfigürasyonu
                  </h4>
                </div>

                {/* Bilet Başına Sayı Adedi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bilet Başına Sayı Adedi *
                  </label>
                  <select
                    name="numbersPerTicket"
                    value={formData.numbersPerTicket}
                    onChange={(e) => setFormData(prev => ({ ...prev, numbersPerTicket: parseInt(e.target.value) }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={3}>3 Sayı (999/3 = 333 bilet)</option>
                    <option value={6}>6 Sayı (999/6 = 166 bilet)</option>
                    <option value={9}>9 Sayı (999/9 = 111 bilet)</option>
                    <option value={12}>12 Sayı (999/12 = 83 bilet)</option>
                  </select>
                </div>

                {/* Minimum Katılımcı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Katılımcı Sayısı *
                  </label>
                  <input
                    type="number"
                    name="minParticipants"
                    value={formData.minParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, minParticipants: parseInt(e.target.value) }))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="10"
                  />
                </div>

                {/* Kullanıcı Başına Max Bilet */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kullanıcı Başına Maksimum Bilet Sayısı *
                  </label>
                  <input
                    type="number"
                    name="maxTicketsPerUser"
                    value={formData.maxTicketsPerUser}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTicketsPerUser: parseInt(e.target.value) }))}
                    required
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Her kullanıcının bu çekilişten alabileceği maksimum bilet sayısı
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    'Çekiliş Oluştur'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}