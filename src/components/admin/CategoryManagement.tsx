'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiX, FiCheck } from 'react-icons/fi'
import { useAuth } from '@/shared/context/AuthContext'

interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoryManagement() {
  const { token, isAuthenticated, isAdmin } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })

  // Slug generate function
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      console.log('CategoryManagement - Token:', token ? `${token.substring(0, 20)}...` : 'Token yok');

      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Kategoriler getirilemedi')
      const data = await response.json()
      console.log('CategoryManagement - Backend response:', data);

      // Backend response format'ına göre categories'i parse et
      const categoriesData = data.data?.categories || data.categories || data.data || [];
      console.log('CategoryManagement - Parsed categories:', categoriesData);
      setCategories(categoriesData)
    } catch (error: any) {
      console.error('Kategorileri getirme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      // Backend'in beklediği formata uygun veri hazırla
      const categoryData = {
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        status: formData.isActive ? 'active' : 'inactive',
        isActive: formData.isActive
      };

      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori eklenemedi');
      }

      setShowAddModal(false);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error: any) {
      console.error('Kategori ekleme hatası:', error);
      alert('Kategori eklenirken bir hata oluştu: ' + (error.message || error));
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return;

    try {
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      // Backend'in beklediği formata uygun veri hazırla
      const categoryData = {
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        status: formData.isActive ? 'active' : 'inactive',
        isActive: formData.isActive
      };

      const response = await fetch(`http://localhost:5000/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori güncellenemedi');
      }

      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', isActive: true });
      fetchCategories();
    } catch (error: any) {
      console.error('Kategori güncelleme hatası:', error);
      alert('Kategori güncellenirken bir hata oluştu: ' + (error.message || error));
    }
  };

  const toggleCategoryStatus = async (categoryId: string, newStatus: boolean) => {
    try {
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus ? 'active' : 'inactive',
          isActive: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori durumu güncellenemedi');
      }

      fetchCategories();
    } catch (error: any) {
      console.error('Kategori durum güncelleme hatası:', error);
      alert('Kategori durumu güncellenirken bir hata oluştu: ' + (error.message || error));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      if (!token) {
        throw new Error('Yetkilendirme token\'ı bulunamadı');
      }

      const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kategori silinemedi');
      }

      fetchCategories();
    } catch (error: any) {
      console.error('Kategori silme hatası:', error);
      alert('Kategori silinirken bir hata oluştu: ' + (error.message || error));
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
  };

  const filteredCategories = categories.filter(category => {
    if (!category) return false;
    const categoryName = category.name || '';
    const categoryDescription = category.description || '';

    return !searchTerm ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryDescription.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Kategori Yönetimi</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Kategori ara..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={fetchCategories}
            className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="mr-2" />
            Yenile
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90"
          >
            <FiPlus className="mr-2" />
            Yeni Kategori
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm
              ? 'Arama kriterlerine uygun kategori bulunamadı.'
              : 'Henüz kategori bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {category.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              {category.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {category.description}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Oluşturulma: {new Date(category.createdAt).toLocaleDateString('tr-TR')}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleCategoryStatus(category._id, !category.isActive)}
                  className={`flex items-center px-3 py-1 text-sm rounded ${
                    category.isActive
                      ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
                      : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                  }`}
                >
                  {category.isActive ? (
                    <>
                      <FiX className="w-4 h-4 mr-1" />
                      Pasif Yap
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4 mr-1" />
                      Aktif Yap
                    </>
                  )}
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FiEdit className="w-4 h-4 mr-1" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="flex items-center px-3 py-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FiTrash2 className="w-4 h-4 mr-1" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Yeni Kategori Ekle</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Kategori Adı</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                  rows={3}
                />
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
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Kategori Düzenle</h2>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Kategori Adı</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white"
                  rows={3}
                />
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
                  onClick={closeModals}
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
  )
}