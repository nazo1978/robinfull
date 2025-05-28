'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff, FiUser, FiLock, FiMail, FiUserPlus } from 'react-icons/fi'
import { authService } from '@/shared/services/authService'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Aydınlatma metni kontrolü
    if (!privacyAccepted) {
      setError('Kişisel verilerin korunması hakkında aydınlatma metnini okuyup onaylamanız gerekiyor')
      setLoading(false)
      return
    }

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    // Şifre güvenlik kontrolü
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      console.log('📝 Frontend register attempt:', { email: formData.email });

      // AuthService ile backend'e direkt istek
      const response = await authService.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Frontend register success:', response);

      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err: any) {
      console.error('❌ Frontend register error:', err);
      setError(err.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="auto-card w-full max-w-md p-8 rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Kayıt Ol</h1>
          <p className="text-gray-600 dark:text-gray-400">
            RobinHoot'a üye olarak alışverişe başlayın
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 text-center">
            <p className="font-medium">Kayıt işlemi başarılı!</p>
            <p className="mt-2">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Ad Soyad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="Kullanıcı adı"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email adresiniz"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="En az 8 karakter"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Şifrenizi tekrar girin"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Aydınlatma Metni Onayı */}
            <div className="flex items-start space-x-3 mb-6">
              <input
                id="privacyAccepted"
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="privacyAccepted" className="text-sm text-gray-600 dark:text-gray-400">
                <a
                  href="/kisisel_verilerin_korunmasi_hakkinda_aydinlatma_metni.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline font-medium"
                >
                  Kişisel Verilerin Korunması Hakkında Aydınlatma Metni
                </a>
                'ni okudum ve anladım.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !privacyAccepted}
              className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-full flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kayıt Yapılıyor...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiUserPlus className="mr-2" />
                  Kayıt Ol
                </span>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-black hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Şirket kaydı için{' '}
            <Link href="/auth/company-register" className="text-black hover:underline font-medium">
              buraya tıklayın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}