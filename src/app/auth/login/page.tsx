'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiEye, FiEyeOff, FiUser, FiLock, FiLogIn } from 'react-icons/fi'
import { useAuth } from '@/shared/context/AuthContext'
import { authService } from '@/shared/services/authService'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

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

    try {
      console.log('🔐 Frontend login attempt:', { email: formData.email });

      // AuthService ile backend'e direkt istek
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      console.log('✅ Frontend login success:', response);

      // AuthContext'e kullanıcı bilgilerini kaydet
      login(response.data.user, response.data.token);

      // Redirect parametresini kontrol et
      const redirectUrl = searchParams.get('redirect');

      // Kullanıcı rolüne göre yönlendirme
      console.log('Kullanıcı rolü:', response.data.user?.role);

      if (response.data.user?.role === 'admin') {
        console.log('Admin paneline yönlendiriliyor...');
        router.push('/admin/dashboard');
      } else if (redirectUrl) {
        console.log('Redirect URL\'ye yönlendiriliyor:', redirectUrl);
        router.push(redirectUrl);
      } else {
        console.log('Ana sayfaya yönlendiriliyor...');
        router.push('/');
      }
    } catch (err: any) {
      console.error('❌ Frontend login error:', err);
      setError(err.message || 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="auto-card w-full max-w-md p-8 rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Giriş Yap</h1>
          <p className="text-gray-600 dark:text-gray-400">
            RobinHoot hesabınıza giriş yapın. Admin kullanıcılar otomatik olarak yönetim paneline yönlendirilecektir.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
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

          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Şifre
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Şifremi Unuttum
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Şifreniz"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white dark:bg-white dark:text-black py-2 px-4 rounded-full flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Giriş Yapılıyor...
              </span>
            ) : (
              <span className="flex items-center">
                <FiLogIn className="mr-2" />
                Giriş Yap
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-black hover:underline font-medium">
              Kayıt Ol
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