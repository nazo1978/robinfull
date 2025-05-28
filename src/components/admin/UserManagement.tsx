import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiUserCheck
} from 'react-icons/fi';
import { useAuth } from '@/shared/context/AuthContext';
import UserFormModal from './UserFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

// Kullanıcı tipi
interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'seller';
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  canBid?: boolean;
  canParticipateInLottery?: boolean;
  avatar?: string;
  createdAt: string;
  password?: string; // Sadece yeni kullanıcı oluştururken kullanılır
}

const UserManagement = () => {
  const { token, isAuthenticated, isAdmin } = useAuth();

  // State tanımlamaları
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      // Sorgu parametrelerini oluştur
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        sort: sortField,
        order: sortOrder
      }).toString();

      console.log('🔍 Fetching users:', { queryParams });

      const response = await fetch(`http://localhost:5000/api/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Users response status:', response.status);

      const data = await response.json();
      console.log('📥 Users response data:', data);
      console.log('📥 Raw users array:', data.data?.users || data.users);

      if (!response.ok) {
        throw new Error(data.message || 'Kullanıcılar getirilirken bir hata oluştu');
      }

      const users = data.data?.users || data.users || [];
      console.log('👥 Users loaded:', users.map(u => ({
        id: u._id,
        idType: typeof u._id,
        name: u.name,
        email: u.email,
        fullUser: u
      })));

      setUsers(users);
      setTotalPages(data.data?.totalPages || data.totalPages || 1);
      setTotalUsers(data.data?.total || data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Kullanıcılar getirilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde ve filtreler/sayfa değiştiğinde kullanıcıları getir
  useEffect(() => {
    if (isAuthenticated && isAdmin && token) {
      fetchUsers();
    }
  }, [currentPage, searchTerm, roleFilter, sortField, sortOrder, isAuthenticated, isAdmin, token]);

  // Auth kontrolü
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Bu sayfaya erişim yetkiniz yok. Admin olarak giriş yapmanız gerekiyor.
        </div>
      </div>
    );
  }

  // Kullanıcı oluşturma/güncelleme işlemi
  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      console.log('💾 Saving user data:', userData);
      console.log('💾 Selected user:', selectedUser);

      setIsFormSubmitting(true);

      if (!token) {
        throw new Error('Admin oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      }

      let response;
      if (selectedUser) {
        console.log('✏️ Updating user:', {
          selectedUser,
          userId: selectedUser._id,
          userIdType: typeof selectedUser._id
        });

        if (!selectedUser._id || selectedUser._id === 'undefined') {
          throw new Error('Geçersiz kullanıcı ID\'si');
        }

        // Kullanıcıyı güncelle
        console.log('🔥 PUT request URL:', `http://localhost:5000/api/users/${selectedUser._id}`);
        response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData),
        });
      } else {
        // Yeni kullanıcı oluştur
        response = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData),
        });
      }

      const data = await response.json();
      console.log('📥 Save user response:', { status: response.status, data });

      if (!response.ok) {
        console.error('❌ Save user failed:', data);
        throw new Error(data.message || 'Kullanıcı kaydedilirken bir hata oluştu');
      }

      // Kullanıcıları tekrar getir ve formu kapat
      fetchUsers();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || 'Kullanıcı kaydedilirken bir hata oluştu');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Kullanıcı silme işlemi
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    console.log('🗑️ Deleting user:', {
      selectedUser,
      userId: selectedUser._id,
      userIdType: typeof selectedUser._id
    });

    if (!selectedUser._id || selectedUser._id === 'undefined') {
      setError('Geçersiz kullanıcı ID\'si');
      return;
    }

    try {
      setIsFormSubmitting(true);

      if (!token) {
        throw new Error('Admin oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      }

      console.log('🔥 DELETE request URL:', `http://localhost:5000/api/users/${selectedUser._id}`);

      const response = await fetch(`http://localhost:5000/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kullanıcı silinirken bir hata oluştu');
      }

      // Kullanıcıları tekrar getir ve modalı kapat
      fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccess('Kullanıcı başarıyla silindi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Kullanıcı silinirken bir hata oluştu');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Kullanıcı onaylama
  const handleApproveUser = async (userId: string, reason: string = '') => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmanız gerekiyor');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        // Kullanıcı listesini güncelle
        setUsers(users.map(user =>
          user._id === userId
            ? { ...user, isApproved: true, approvalStatus: 'approved', canBid: true, canParticipateInLottery: true }
            : user
        ));
        setSuccess('Kullanıcı başarıyla onaylandı');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Kullanıcı onaylanırken bir hata oluştu');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Kullanıcı onaylama hatası:', error);
      setError('Kullanıcı onaylanırken bir hata oluştu');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Kullanıcı reddetme
  const handleRejectUser = async (userId: string, reason: string) => {
    try {
      if (!token) {
        setError('Bu işlem için giriş yapmanız gerekiyor');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        // Kullanıcı listesini güncelle
        setUsers(users.map(user =>
          user._id === userId
            ? { ...user, isApproved: false, approvalStatus: 'rejected', rejectionReason: reason, canBid: false, canParticipateInLottery: false }
            : user
        ));
        setSuccess('Kullanıcı başarıyla reddedildi');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Kullanıcı reddedilirken bir hata oluştu');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Kullanıcı reddetme hatası:', error);
      setError('Kullanıcı reddedilirken bir hata oluştu');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Kullanıcı düzenleme modalını aç
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Kullanıcı silme modalını aç
  const handleShowDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Yeni kullanıcı ekleme modalını aç
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-semibold mb-4 md:mb-0">Kullanıcı Yönetimi</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="border rounded-md px-10 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="relative">
            <select
              className="border rounded-md pl-10 pr-4 py-2 bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tüm Roller</option>
              <option value="user">Kullanıcı</option>
              <option value="admin">Admin</option>
              <option value="seller">Satıcı</option>
            </select>
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={handleAddUser}
            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" /> Yeni Kullanıcı
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'username') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('username');
                    setSortOrder('asc');
                  }
                }}
              >
                Kullanıcı
                {sortField === 'username' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'role') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('role');
                    setSortOrder('asc');
                  }
                }}
              >
                Rol
                {sortField === 'role' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Durum
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Onay Durumu
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'createdAt') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('createdAt');
                    setSortOrder('desc');
                  }
                }}
              >
                Kayıt Tarihi
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black dark:border-white"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                  Kullanıcı bulunamadı
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar || 'https://via.placeholder.com/40'}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        user.role === 'seller' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                      {user.role === 'admin' ? 'Admin' :
                        user.role === 'seller' ? 'Satıcı' : 'Kullanıcı'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {user.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.isEmailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {user.isEmailVerified ? 'E-posta Doğrulanmış' : 'E-posta Doğrulanmamış'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.approvalStatus === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          user.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          user.approvalStatus === 'suspended' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {user.approvalStatus === 'approved' ? 'Onaylandı' :
                          user.approvalStatus === 'rejected' ? 'Reddedildi' :
                          user.approvalStatus === 'suspended' ? 'Askıya Alındı' : 'Beklemede'}
                      </span>
                      {user.canBid && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Teklif Verebilir
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200"
                        >
                          <FiEdit2 className="inline mr-1" /> Düzenle
                        </button>
                        <button
                          onClick={() => handleShowDeleteModal(user)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                        >
                          <FiTrash2 className="inline mr-1" /> Sil
                        </button>
                      </div>
                      {user.role !== 'admin' && (
                        <div className="flex space-x-2">
                          {user.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 text-xs"
                            >
                              ✓ Onayla
                            </button>
                          )}
                          {user.approvalStatus !== 'rejected' && user.approvalStatus === 'approved' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Reddetme sebebi (opsiyonel):');
                                if (reason !== null) {
                                  handleRejectUser(user._id, reason);
                                }
                              }}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-xs"
                            >
                              ✗ Reddet
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Toplam {totalUsers} kullanıcı | Sayfa {currentPage} / {totalPages}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Önceki
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Sonraki
          </button>
        </div>
      </div>

      {/* Kullanıcı ekleme/düzenleme modalı için buraya UserFormModal eklenecek */}
      {showUserModal && (
        <UserFormModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
          isSubmitting={isFormSubmitting}
        />
      )}

      {/* Silme onay modalı */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Kullanıcı Silme"
          message={`${selectedUser?.name} isimli kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          isSubmitting={isFormSubmitting}
        />
      )}
    </div>
  );
};

export default UserManagement;
