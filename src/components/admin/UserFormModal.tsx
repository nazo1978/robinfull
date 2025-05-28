import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

// Kullanıcı tipi
interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'seller';
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
  password?: string;
}

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  isSubmitting: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  onClose,
  onSave,
  isSubmitting
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    username: '',
    role: 'user',
    status: 'active',
    isEmailVerified: false,
    avatar: ''
  });

  // Password state (Yeni kullanıcı için)
  const [password, setPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Eğer düzenleme modundaysa, form verilerini kullanıcı verileriyle doldur
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar || ''
      });
    } else {
      // Yeni kullanıcı için form alanlarını sıfırla
      setFormData({
        name: '',
        email: '',
        username: '',
        role: 'user',
        status: 'active',
        isEmailVerified: false,
        avatar: ''
      });
      setPassword('');
    }
  }, [user]);

  // Form değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Hata mesajını temizle
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Şifre değişikliğini işle
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);

    // Hata mesajını temizle
    if (errors.password) {
      setErrors({ ...errors, password: '' });
    }
  };

  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Ad kontrolü
    if (!formData.name?.trim()) {
      newErrors.name = 'Ad alanı zorunludur';
    }

    // E-posta kontrolü
    if (!formData.email?.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    // Kullanıcı adı kontrolü
    if (!formData.username?.trim()) {
      newErrors.username = 'Kullanıcı adı zorunludur';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    // Şifre kontrolü (Sadece yeni kullanıcı için)
    if (!user && !password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (!user && password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Kullanıcı verilerini hazırla
    const userData: Partial<User> = { ...formData };

    // Eğer yeni kullanıcıysa ve şifre varsa, şifreyi ekle
    if (!user && password) {
      userData.password = password;
    }

    onSave(userData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Ad */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Kullanıcının adı soyadı"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* E-posta */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="ornek@mail.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Kullanıcı Adı */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="kullanici_adi"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Şifre (Sadece yeni kullanıcı oluşturma) */}
          {!user && (
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="******"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
          )}

          {/* Rol */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role || 'user'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="user">Kullanıcı</option>
              <option value="seller">Satıcı</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Avatar URL */}
          <div className="mb-4">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Avatar URL (İsteğe bağlı)
            </label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {/* Durum */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durum
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || 'active'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="suspended">Askıya Alınmış</option>
            </select>
          </div>

          {/* E-posta Doğrulanmış */}
          <div className="mb-6 flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isEmailVerified"
                name="isEmailVerified"
                type="checkbox"
                checked={formData.isEmailVerified}
                onChange={(e) => setFormData({ ...formData, isEmailVerified: e.target.checked })}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isEmailVerified" className="font-medium text-gray-700 dark:text-gray-300">
                E-posta Doğrulanmış
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                E-posta doğrulama işlemi tamamlanmış
              </p>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;