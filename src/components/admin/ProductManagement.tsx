'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiImage, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/shared/context/AuthContext';

interface Product {
  id: string;
  _id?: string; // Backward compatibility
  name: string;
  description: string;
  price: number;
  category?: string | { _id: string; name: string };
  categoryId?: string;
  categoryName?: string;
  stock?: number;
  stockQuantity?: number;
  images?: { url: string; alt: string }[];
  featured?: boolean;
  discountPercentage?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  modifiedDate?: string;
}

interface ProductFormData {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: { url: string; alt: string }[];
  featured: boolean;
  discountPercentage: number;
  isActive: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  images: [{ url: 'https://picsum.photos/400/300', alt: '' }],
  featured: false,
  discountPercentage: 0,
  isActive: true
};

const ProductManagement: React.FC = () => {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ürün onaylama/reddetme
  const handleProductApproval = async (productId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const response = await fetch(`/api/admin/products/${productId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          reason: reason || undefined
        })
      });

      if (!response.ok) throw new Error(`Ürün ${action === 'approve' ? 'onaylanamadı' : 'reddedilemedi'}`);

      setSuccessMessage(`Ürün başarıyla ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`);

      // Ürünleri yeniden yükle
      const res = await fetch('http://localhost:5000/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Ürün onay/red hatası:', error);
      setError(`Ürün ${action === 'approve' ? 'onaylanırken' : 'reddedilirken'} bir hata oluştu`);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Kategorileri getir
  const fetchCategories = async () => {
    try {
      if (!token) return;

      const response = await fetch('http://localhost:5128/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔥 ProductManagement - Categories response:', data);

        // Backend direkt array dönüyor
        const categoriesData = Array.isArray(data) ? data : (data.data?.categories || data.categories || data.data || []);
        console.log('🔥 ProductManagement - Final categories:', categoriesData);
        console.log('🔥 ProductManagement - Categories count:', categoriesData.length);

        setCategories(categoriesData);
      } else {
        console.error('🔥 ProductManagement - Categories fetch failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Kategoriler getirilirken hata:', error);
    }
  };

  // Ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Admin için TÜM ürünleri getir (admin + seller ürünleri)
        if (!token) {
          setError('Yetkilendirme token\'ı bulunamadı');
          return;
        }

        const res = await fetch('http://localhost:5128/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          // Admin endpoint yoksa normal endpoint'i dene
          const fallbackRes = await fetch('http://localhost:5128/api/products');
          if (!fallbackRes.ok) throw new Error('Ürünler alınamadı');
          const fallbackData = await fallbackRes.json();
          console.log('Fallback API yanıtı:', fallbackData);
          setProducts(fallbackData.products || []);
          return;
        }

        const data = await res.json();
        console.log('Products API yanıtı:', data);
        // Backend direkt array dönüyor
        const productsData = Array.isArray(data) ? data : (data.data?.products || data.products || data.data || []);
        setProducts(productsData);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
        console.error('Ürünler yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin && token) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAuthenticated, isAdmin, token]);

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

  // Form değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'price' || name === 'stock' || name === 'discountPercentage') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Resim URL'sini değiştir
  const handleImageChange = (index: number, field: 'url' | 'alt', value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setFormData({ ...formData, images: updatedImages });
  };

  // Yeni resim ekle
  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', alt: '' }]
    });
  };

  // Resim sil
  const removeImage = (index: number) => {
    if (formData.images.length <= 1) return;
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  // Ürün düzenleme formunu aç
  const handleEdit = (product: Product) => {
    console.log('Düzenlenecek ürün:', product);

    // Backend'ten gelen categoryId'yi kullan
    let categoryId = product.categoryId || '';

    // Backend'ten gelen image data'sını işle
    const images = product.imageUrl
      ? [{ url: product.imageUrl, alt: product.imageAlt || product.name || '' }]
      : product.images && product.images.length > 0
        ? product.images.map(img => ({ url: img.url || '', alt: img.alt || '' }))
        : [{ url: 'https://picsum.photos/400/300', alt: product.name || '' }];

    setFormData({
      _id: product._id,
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: product.price !== undefined ? product.price : 0,
      category: categoryId,
      stock: product.stockQuantity || product.stock || 0,
      images: images,
      featured: product.featured !== undefined ? product.featured : false,
      discountPercentage: product.discountPercentage !== undefined ? product.discountPercentage : 0,
      isActive: typeof product.isActive === 'boolean' ? product.isActive : true
    });

    setIsEditing(true);
    setShowForm(true);
  };

  // Yeni ürün ekleme formunu aç
  const handleAddNew = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowForm(true);
  };

  // Formu kapat
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData(initialFormData);
    setIsEditing(false);
  };

  // Ürün sil
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      if (!token) {
        setError('Bu işlem için giriş yapmanız gerekiyor');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Doğrudan backend API'sine istek at
      const res = await fetch(`http://localhost:5128/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ürün silinemedi');
      }

      // Ürünü listeden kaldır
      setProducts(products.filter(product => product._id !== id));
      setSuccessMessage('Ürün başarıyla silindi');

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Ürün silinirken bir hata oluştu');
      console.error('Ürün silinirken hata:', err);

      // 3 saniye sonra hata mesajını kaldır
      setTimeout(() => setError(null), 3000);
    }
  };

  // Form gönder (ekleme veya güncelleme)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!token) {
        setError('Bu işlem için giriş yapmanız gerekiyor');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Form validation
      if (!formData.name || formData.name.trim() === '') {
        throw new Error('Ürün adı gereklidir');
      }
      if (!formData.description || formData.description.trim() === '') {
        throw new Error('Ürün açıklaması gereklidir');
      }
      if (!formData.price || formData.price <= 0) {
        throw new Error('Geçerli bir fiyat giriniz');
      }
      if (!formData.stock || formData.stock < 0) {
        throw new Error('Geçerli bir stok miktarı giriniz');
      }
      if (!formData.category || formData.category === '') {
        throw new Error('Lütfen bir kategori seçin');
      }

      console.log('Kullanılacak token:', token ? `${token.substring(0, 20)}...` : 'Token yok');
      console.log('🔥 ProductManagement - Form data before processing:', formData);
      console.log('🔥 ProductManagement - formData.category:', formData.category);
      console.log('🔥 ProductManagement - formData.category type:', typeof formData.category);

      // Category ID'sini doğru şekilde işle
      let categoryId = null;
      if (formData.category && formData.category !== '') {
        // Eğer category GUID formatındaysa kullan
        if (formData.category.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i)) {
          categoryId = formData.category;
          console.log('🔥 Category is valid GUID:', categoryId);
        } else if (formData.category.match(/^[0-9a-fA-F]{24}$/)) {
          // MongoDB ObjectId formatı
          categoryId = formData.category;
          console.log('🔥 Category is valid ObjectId:', categoryId);
        } else {
          // Category name ise ID'sini bul
          const foundCategory = categories.find(cat => cat.name === formData.category);
          if (foundCategory) {
            categoryId = foundCategory.id || foundCategory._id;
            console.log('🔥 Category name converted to ID:', categoryId, 'for name:', formData.category);
          } else {
            console.warn('🔥 Category not found for name:', formData.category);
            console.log('🔥 Available category names:', categories.map(cat => cat.name));
          }
        }
      }

      if (!categoryId) {
        throw new Error('Lütfen bir kategori seçin');
      }

      console.log('🔥 Final categoryId:', categoryId);

      // Image URL'sini hazırla
      const imageUrl = formData.images && formData.images.length > 0 && formData.images[0].url
        ? formData.images[0].url
        : "https://picsum.photos/400/300";

      const imageAlt = formData.images && formData.images.length > 0 && formData.images[0].alt
        ? formData.images[0].alt
        : formData.name;

      // Backend'in beklediği formata uygun veri hazırla (Pascal Case)
      const formDataToSend = isEditing ? {
        Id: formData._id || formData.id,
        Name: formData.name,
        Description: formData.description,
        Price: Number(formData.price),
        StockQuantity: Number(formData.stock),
        IsActive: formData.isActive,
        ImageUrl: imageUrl,
        ImageAlt: imageAlt,
        CategoryId: categoryId
      } : {
        Name: formData.name,
        Description: formData.description,
        Price: Number(formData.price),
        StockQuantity: Number(formData.stock),
        IsActive: formData.isActive,
        ImageUrl: imageUrl,
        ImageAlt: imageAlt,
        CategoryId: categoryId
      };

      console.log('Gönderilecek form verisi:', formDataToSend);

      // Doğrudan backend API'sine istek at
      const url = isEditing
        ? `http://localhost:5128/api/products/${formData._id || formData.id}`
        : 'http://localhost:5128/api/products';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formDataToSend)
      });

      if (!res.ok) {
        let errorMessage = isEditing ? 'Ürün güncellenemedi' : 'Ürün eklenemedi';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Backend error response:', errorData);
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
          console.error('Backend error text:', errorText);
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log('API yanıtı:', data);

      // Backend response format: ProductDto
      const updatedProduct = data;
      console.log('🔥 Updated product:', updatedProduct);

      if (isEditing) {
        // Ürünü listede güncelle
        if (updatedProduct) {
          setProducts(products.map(product =>
            (product.id || product._id) === (updatedProduct.id || updatedProduct._id) ? updatedProduct : product
          ));
          setSuccessMessage('Ürün başarıyla güncellendi');
        }
      } else {
        // Yeni ürünü listeye ekle
        if (updatedProduct) {
          setProducts([...products, updatedProduct]);
          setSuccessMessage('Ürün başarıyla eklendi');
        }
      }

      // Formu kapat
      handleCloseForm();

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'İşlem sırasında bir hata oluştu');
      console.error('Ürün kaydedilirken hata:', err);

      // 3 saniye sonra hata mesajını kaldır
      setTimeout(() => setError(null), 3000);
    }
  };

  // Kategori adını getir
  const getCategoryName = (product: any) => {
    // Backend'ten gelen categoryName field'ını önce kontrol et
    if (product.categoryName) {
      return product.categoryName;
    }

    // categoryId string ise (GUID), categories array'inde ara
    if (product.categoryId && typeof product.categoryId === 'string') {
      const foundCategory = categories.find(cat => (cat.id || cat._id) === product.categoryId);
      if (foundCategory) {
        return foundCategory.name;
      }
    }

    // category field'ını kontrol et (backward compatibility)
    if (product.category) {
      if (typeof product.category === 'object' && product.category.name) {
        return product.category.name;
      } else if (typeof product.category === 'string') {
        const foundCategory = categories.find(cat => (cat.id || cat._id) === product.category);
        if (foundCategory) {
          return foundCategory.name;
        }
      }
    }

    return 'Kategori Yok';
  };

  // Filtrelenmiş ürünler - products'ın array olduğundan emin ol
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const categoryName = getCategoryName(product).toLowerCase();
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           categoryName.includes(searchTerm.toLowerCase());
  }) : [];

  if (loading) return <div className="p-6 text-center">Yükleniyor...</div>;

  return (
    <div className="p-6">
      {/* Başlık ve Arama */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">Ürün Yönetimi</h2>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center justify-center bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <FiPlus className="mr-2" />
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* Hata ve Başarı Mesajları */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <FiAlertCircle className="mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Ürün Listesi */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Arama kriterlerine uygun ürün bulunamadı.' : 'Henüz ürün bulunmuyor.'}
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            İlk Ürünü Ekle
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ürün</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fiyat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Seller Durumu</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id || product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.imageUrl || (product.images && product.images.length > 0 ? product.images[0].url : 'https://picsum.photos/400/300')}
                            alt={product.imageAlt || product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{product.categoryName || getCategoryName(product)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{product.price?.toLocaleString('tr-TR')} ₺</div>
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <div className="text-xs text-green-600">%{product.discountPercentage} indirim</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{product.stockQuantity || product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {product.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(product as any).isSellerProduct ? (
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (product as any).status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : (product as any).status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {(product as any).status === 'approved' ? 'Onaylandı' :
                             (product as any).status === 'rejected' ? 'Reddedildi' : 'Onay Bekliyor'}
                          </span>
                          {(product as any).status === 'pending' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleProductApproval(product._id, 'approve')}
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleProductApproval(product._id, 'reject', 'Admin tarafından reddedildi')}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              >
                                Reddet
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Admin Ürünü
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        <FiEdit className="inline" /> Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash2 className="inline" /> Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ürün Ekleme/Düzenleme Formu */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {isEditing ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ürün Adı</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      required
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.filter(cat => cat.isActive !== false).map(category => {
                        const categoryId = category.id || category._id;
                        return (
                          <option key={categoryId} value={categoryId}>
                            {category.name}
                          </option>
                        );
                      })}
                      {categories.length === 0 && (
                        <option value="" disabled>Kategori bulunamadı</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fiyat (₺)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">İndirim Oranı (%)</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stok Miktarı</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Öne Çıkan</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Aktif</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    rows={4}
                    required
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Ürün Görselleri</label>
                    <button
                      type="button"
                      onClick={addImage}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FiPlus className="mr-1" /> Görsel Ekle
                    </button>
                  </div>

                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-4 mb-2">
                      <div className="flex-grow">
                        <input
                          type="text"
                          placeholder="Görsel URL"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                          className="w-full p-2 border rounded-lg mb-2"
                        />
                        <input
                          type="text"
                          placeholder="Alternatif Metin"
                          value={image.alt}
                          onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>

                      {image.url && (
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            src={image.url}
                            alt={image.alt || 'Ürün görseli'}
                            className="h-16 w-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300';
                            }}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={formData.images.length <= 1}
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center"
                  >
                    <FiSave className="mr-2" />
                    {isEditing ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;