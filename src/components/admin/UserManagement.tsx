'use client'

import { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiX, FiCheck, FiUser, FiMail, FiShield } from 'react-icons/fi'
import { useAuth } from '@/shared/context/AuthContext'

interface User {
  id: string
  username: string
  email: string
  emailConfirmed: boolean
  lastLoginDate?: string
  isActive: boolean
  isDeleted: boolean
  userType: string
  createdDate: string
  modifiedDate?: string
}

function UserManagement() {
  const { token, isAuthenticated, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    emailConfirmed: false,
    isActive: true,
    userType: 'User'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      console.log('UserManagement - Token:', token ? `${token.substring(0, 20)}...` : 'Token yok');

      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('searchTerm', searchTerm);
      if (userTypeFilter) queryParams.append('userType', userTypeFilter);
      if (isActiveFilter !== null) queryParams.append('isActive', isActiveFilter.toString());

      const response = await fetch(`http://localhost:5128/api/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Kullanıcılar getirilemedi')
      const data = await response.json()
      console.log('UserManagement - Backend response:', data);

      setUsers(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Kullanıcıları getirme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return;

    try {
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const userData = {
        Username: formData.username,
        Email: formData.email,
        EmailConfirmed: formData.emailConfirmed,
        IsActive: formData.isActive,
        UserType: formData.userType
      };

      const response = await fetch(`http://localhost:5128/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        let errorMessage = 'Kullanıcı güncellenemedi';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setShowEditModal(false);
      setEditingUser(null);
      setFormData({ username: '', email: '', emailConfirmed: false, isActive: true, userType: 'User' });
      fetchUsers();
    } catch (error: any) {
      console.error('Kullanıcı güncelleme hatası:', error);
      alert('Kullanıcı güncellenirken bir hata oluştu: ' + (error.message || error));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const response = await fetch(`http://localhost:5128/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı silinemedi');
      }

      fetchUsers();
    } catch (error: any) {
      console.error('Kullanıcı silme hatası:', error);
      alert('Kullanıcı silinirken bir hata oluştu: ' + (error.message || error));
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      isActive: user.isActive,
      userType: user.userType
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', emailConfirmed: false, isActive: true, userType: 'User' });
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'Admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Seller':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'Admin':
        return <FiShield className="w-4 h-4" />;
      case 'Seller':
        return <FiUser className="w-4 h-4" />;
      default:
        return <FiUser className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Kullanıcı Yönetimi</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <option value="">Tüm Tipler</option>
            <option value="Admin">Admin</option>
            <option value="Seller">Satıcı</option>
            <option value="User">Kullanıcı</option>
          </select>

          <select
            value={isActiveFilter === null ? '' : isActiveFilter.toString()}
            onChange={(e) => setIsActiveFilter(e.target.value === '' ? null : e.target.value === 'true')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>

          <button
            onClick={fetchUsers}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || userTypeFilter || isActiveFilter !== null
              ? 'Arama kriterlerine uygun kullanıcı bulunamadı.'
              : 'Henüz kullanıcı bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Son Giriş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <FiMail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.userType)}`}>
                        {getUserTypeIcon(user.userType)}
                        <span className="ml-1">{user.userType}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {user.isActive ? (
                            <>
                              <FiCheck className="w-3 h-3 mr-1" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <FiX className="w-3 h-3 mr-1" />
                              Pasif
                            </>
                          )}
                        </span>
                        {user.emailConfirmed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            <FiMail className="w-3 h-3 mr-1" />
                            Email Onaylı
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginDate
                        ? new Date(user.lastLoginDate).toLocaleDateString('tr-TR')
                        : 'Hiç giriş yapmamış'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Kullanıcı Düzenle</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Kullanıcı Tipi</label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({...formData, userType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                >
                  <option value="User">Kullanıcı</option>
                  <option value="Seller">Satıcı</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emailConfirmed}
                    onChange={(e) => setFormData({...formData, emailConfirmed: e.target.checked})}
                    className="mr-2"
                  />
                  Email Onaylı
                </label>
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  Aktif
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
