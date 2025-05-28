'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMail, FiArrowLeft } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Demo için sadece simülasyon
      setTimeout(() => {
        setSuccess(true)
        setLoading(false)
      }, 1500)
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="auto-card w-full max-w-md p-8 rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Şifremi Unuttum</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hesabınıza bağlı email adresinizi girin, size şifre sıfırlama bağlantısı göndereceğiz.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            <p className="font-medium">Şifre sıfırlama bağlantısı gönderildi!</p>
            <p className="mt-2">
              {email} adresine bir şifre sıfırlama bağlantısı gönderdik. Lütfen email'inizi kontrol edin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Email adresiniz"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                  İşleniyor...
                </span>
              ) : (
                "Şifre Sıfırlama Bağlantısı Gönder"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-blue-600 hover:underline flex items-center justify-center">
            <FiArrowLeft className="mr-2" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  )
} 