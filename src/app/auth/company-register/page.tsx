'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiEye, FiEyeOff, FiUser, FiLock, FiMail, FiPhone } from 'react-icons/fi'
import { cities, companyTypes, productCategories } from '@/data/cities'

export default function CompanyRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    taxNumber: '',
    companyType: '',
    productCategory: '',
    city: '',
    district: '',
    referenceCode: ''
  })
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [companyTermsAccepted, setCompanyTermsAccepted] = useState(false)
  const [additionalData, setAdditionalData] = useState({
    commercialTitle: '',
    tradeRegistryNumber: '',
    fullAddress: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1) // 1: Temel bilgiler, 2: Detay bilgiler + onay

  const selectedCity = cities.find(city => city.name === formData.city)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Telefon numarası formatlaması
    if (name === 'phoneNumber') {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: numbers
        }))
      }
      return
    }

    // Vergi numarası formatlaması
    if (name === 'taxNumber') {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: numbers
        }))
      }
      return
    }

    // Şehir değiştiğinde ilçeyi sıfırla
    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        city: value,
        district: ''
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAdditionalData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // İlk adım validasyonları
    if (!privacyAccepted) {
      setError('Kişisel verilerin korunması hakkında aydınlatma metnini okuyup onaylamanız gerekiyor')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır')
      return
    }

    if (formData.phoneNumber.length !== 11 || !formData.phoneNumber.startsWith('05')) {
      setError('Telefon numarası 05 ile başlamalı ve 11 haneli olmalıdır')
      return
    }

    if (formData.taxNumber.length < 10 || formData.taxNumber.length > 11) {
      setError('Vergi kimlik numarası 10 veya 11 haneli olmalıdır')
      return
    }

    // İkinci adıma geç
    setStep(2)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // İkinci adım validasyonları
    if (!companyTermsAccepted) {
      setError('Şirket satıcı sözleşmesini kabul etmeniz gerekiyor')
      setLoading(false)
      return
    }

    if (!additionalData.commercialTitle.trim()) {
      setError('Şirket ticari ünvanı zorunludur')
      setLoading(false)
      return
    }

    if (!additionalData.tradeRegistryNumber.trim()) {
      setError('Ticaret sicil numarası zorunludur')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/company-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          taxNumber: formData.taxNumber,
          companyType: formData.companyType,
          productCategory: formData.productCategory,
          address: {
            city: formData.city,
            district: formData.district,
            fullAddress: additionalData.fullAddress
          },
          referenceCode: formData.referenceCode || undefined,
          commercialTitle: additionalData.commercialTitle,
          tradeRegistryNumber: additionalData.tradeRegistryNumber
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Kayıt başarısız')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err) {
      setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="auto-card w-full max-w-2xl p-8 rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Şirket Kaydı</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Robinhoot Pazaryeri benzeri platformumuzda satış yapmak için şirket kaydı oluşturun
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 text-center">
            <p className="font-medium">Şirket kaydı başarıyla oluşturuldu!</p>
            <p className="mt-2">Admin onayı bekleniyor. Onaylandıktan sonra giriş yapabileceksiniz.</p>
            <p className="mt-2">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleFirstStep} className="space-y-4">
            {/* Şirket Adı */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                Şirket İsmi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  placeholder="Şirket İsmi"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                E-Posta Adresiniz
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
                  placeholder="E-Posta Adresi"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Cep Telefonunuz
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="05__ ___ __ __"
                  className="pl-10 w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Vergi Kimlik Numarası */}
            <div>
              <label htmlFor="taxNumber" className="block text-sm font-medium mb-1">
                Vergi Kimlik Numaranız
              </label>
              <input
                id="taxNumber"
                name="taxNumber"
                type="text"
                required
                placeholder="Vergi Kimlik Numarası"
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={formData.taxNumber}
                onChange={handleChange}
              />
            </div>

            {/* Şirket Türü */}
            <div>
              <label htmlFor="companyType" className="block text-sm font-medium mb-1">
                Şirket Türü
              </label>
              <select
                id="companyType"
                name="companyType"
                required
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={formData.companyType}
                onChange={handleChange}
              >
                <option value="">Seçim yapınız</option>
                {companyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Ürün Kategorisi */}
            <div>
              <label htmlFor="productCategory" className="block text-sm font-medium mb-1">
                Satılacak Ürün Kategorisi
              </label>
              <select
                id="productCategory"
                name="productCategory"
                required
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={formData.productCategory}
                onChange={handleChange}
              >
                <option value="">Seçim yapınız</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* İl */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                İl
              </label>
              <select
                id="city"
                name="city"
                required
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={formData.city}
                onChange={handleChange}
              >
                <option value="">Seçim yapınız</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* İlçe */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium mb-1">
                İlçe
              </label>
              <select
                id="district"
                name="district"
                required
                disabled={!formData.city}
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.district}
                onChange={handleChange}
              >
                <option value="">Seçim yapınız</option>
                {selectedCity?.districts.map((district) => (
                  <option key={district.name} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Şifre */}
            <div>
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

            {/* Şifre Tekrar */}
            <div>
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

            {/* Referans Kodu */}
            <div>
              <label htmlFor="referenceCode" className="block text-sm font-medium mb-1">
                Referans Kodu (Zorunlu Değil)
              </label>
              <input
                id="referenceCode"
                name="referenceCode"
                type="text"
                placeholder="Varsa Referans Kodu Giriniz..."
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={formData.referenceCode}
                onChange={handleChange}
              />
            </div>

            {/* Aydınlatma Metni Onayı */}
            <div className="flex items-start space-x-3">
              <input
                id="privacyAccepted"
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="privacyAccepted" className="text-sm text-gray-600 dark:text-gray-400">
                <a
                  href="/kisisel_verilerin_korunmasi_hakkinda_aydinlatma_metni-şirketler%20için.pdf"
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
              disabled={!privacyAccepted}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              İleri
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            {/* Geri Butonu */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-4 text-black hover:underline"
            >
              ← Geri
            </button>

            {/* Ticari Ünvan */}
            <div>
              <label htmlFor="commercialTitle" className="block text-sm font-medium mb-1">
                Şirket Ticari Ünvanı
              </label>
              <input
                id="commercialTitle"
                name="commercialTitle"
                type="text"
                required
                placeholder="Ticari Ünvan"
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={additionalData.commercialTitle}
                onChange={handleAdditionalChange}
              />
            </div>

            {/* Ticaret Sicil Numarası */}
            <div>
              <label htmlFor="tradeRegistryNumber" className="block text-sm font-medium mb-1">
                Ticaret Sicil Numarası
              </label>
              <input
                id="tradeRegistryNumber"
                name="tradeRegistryNumber"
                type="text"
                required
                placeholder="Ticaret Sicil Numarası"
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={additionalData.tradeRegistryNumber}
                onChange={handleAdditionalChange}
              />
            </div>

            {/* Tam Adres */}
            <div>
              <label htmlFor="fullAddress" className="block text-sm font-medium mb-1">
                Tam Adres
              </label>
              <textarea
                id="fullAddress"
                name="fullAddress"
                rows={3}
                placeholder="Tam adresinizi yazın..."
                className="w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-black"
                value={additionalData.fullAddress}
                onChange={handleAdditionalChange}
              />
            </div>

            {/* Şirket Satıcı Sözleşmesi Onayı */}
            <div className="flex items-start space-x-3">
              <input
                id="companyTermsAccepted"
                type="checkbox"
                checked={companyTermsAccepted}
                onChange={(e) => setCompanyTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="companyTermsAccepted" className="text-sm text-gray-600 dark:text-gray-400">
                <a
                  href="/kisisel_verilerin_korunmasi_hakkinda_aydinlatma_metni-şirketler için.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline font-medium"
                >
                  Şirket Satıcı Sözleşmesi
                </a>
                'ni okudum ve kabul ediyorum.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !companyTermsAccepted}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Kayıt Oluşturuluyor...' : 'Şirket Kaydı Oluştur'}
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
            Bireysel kayıt için{' '}
            <Link href="/auth/register" className="text-black hover:underline font-medium">
              buraya tıklayın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
