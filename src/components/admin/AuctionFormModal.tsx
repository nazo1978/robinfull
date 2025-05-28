'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import Image from 'next/image'
import SafeImage from '@/components/SafeImage'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Product {
  _id: string
  name: string
  images: string[]
  price: number
}

interface AuctionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (auctionData: any) => void
  initialData?: any
  isEditing?: boolean
}

export default function AuctionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false
}: AuctionFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    productId: '',
    startPrice: 0,
    reservePrice: 0,
    minIncrement: 1,
    startTime: new Date(Date.now() + 3600000), // 1 saat sonra
    endTime: new Date(Date.now() + 3600000 * 24), // 24 saat sonra
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()

      if (isEditing && initialData) {
        setFormData({
          productId: initialData?.productId?._id || '',
          startPrice: initialData?.startPrice || 0,
          reservePrice: initialData?.reservePrice || 0,
          minIncrement: initialData?.minIncrement || 1,
          startTime: initialData?.startTime ? new Date(initialData.startTime) : new Date(Date.now() + 3600000),
          endTime: initialData?.endTime ? new Date(initialData.endTime) : new Date(Date.now() + 3600000 * 24),
        })

        if (initialData?.productId) {
          setSelectedProduct({
            _id: initialData.productId._id,
            name: initialData.productId.name,
            images: initialData.productId.images || [],
            price: initialData.productId.price || 0
          })
        } else {
          setSelectedProduct(null)
        }
      } else {
        resetForm()
      }
    }
  }, [isOpen, isEditing, initialData])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      console.log('Ürünler getiriliyor...')
      const response = await fetch('http://localhost:5000/api/products?limit=100')

      if (response.ok) {
        const data = await response.json()
        console.log('Ürünler başarıyla getirildi:', data)

        if (data && data.products && data.products.length > 0) {
          setProducts(data.products)
        } else {
          console.error('API yanıtında ürün verisi yok veya boş')
          setError('Ürün verisi alınamadı')
          setProducts([])
        }
      } else {
        console.error('API yanıtı başarısız:', response.status)
        setError('Ürünler yüklenirken bir hata oluştu')

        setProducts([])
      }
    } catch (err) {
      console.error('Ürünler çekilirken hata:', err)
      setError('Ürünler yüklenirken bir hata oluştu')

      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      productId: '',
      startPrice: 0,
      reservePrice: 0,
      minIncrement: 1,
      startTime: new Date(Date.now() + 3600000), // 1 saat sonra
      endTime: new Date(Date.now() + 3600000 * 24), // 24 saat sonra
    })
    setSelectedProduct(null)
    setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'productId') {
      const product = products.find(p => p._id === value)
      setSelectedProduct(product || null)

      if (product) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          startPrice: product.price
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'startPrice' || name === 'reservePrice' || name === 'minIncrement'
          ? parseFloat(value)
          : value
      }))
    }
  }

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        startTime: date,
        // Eğer bitiş zamanı başlangıç zamanından önceyse, bitiş zamanını güncelle
        endTime: prev.endTime < date ? new Date(date.getTime() + 3600000 * 24) : prev.endTime
      }))
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        endTime: date
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validasyon
    if (!formData.productId) {
      setError('Lütfen bir ürün seçin')
      return
    }

    if (formData.startPrice <= 0) {
      setError('Başlangıç fiyatı 0\'dan büyük olmalıdır')
      return
    }

    if (formData.reservePrice < 0) {
      setError('Rezerv fiyatı negatif olamaz')
      return
    }

    if (formData.minIncrement <= 0) {
      setError('Minimum artış miktarı 0\'dan büyük olmalıdır')
      return
    }

    if (formData.endTime <= formData.startTime) {
      setError('Bitiş zamanı başlangıç zamanından sonra olmalıdır')
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Açık Artırmayı Düzenle' : 'Yeni Açık Artırma Oluştur'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="productId" className="block text-gray-700 dark:text-gray-300 mb-2">
              Ürün *
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              required
              disabled={isEditing}
            >
              <option value="">Ürün Seçin</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name || 'İsimsiz Ürün'} - {product.price ? product.price.toLocaleString() : 0} ₺
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-16 h-16 relative mr-4">
                  <SafeImage
                    src={selectedProduct?.images}
                    alt={selectedProduct?.name || 'Ürün'}
                    fill
                    className="object-cover rounded-md"
                    fallbackText=""
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedProduct.name || 'İsimsiz Ürün'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Normal Fiyat: {selectedProduct.price ? selectedProduct.price.toLocaleString() : 0} ₺
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startPrice" className="block text-gray-700 dark:text-gray-300 mb-2">
                Başlangıç Fiyatı (₺) *
              </label>
              <input
                type="number"
                id="startPrice"
                name="startPrice"
                value={formData.startPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="reservePrice" className="block text-gray-700 dark:text-gray-300 mb-2">
                Rezerv Fiyatı (₺)
              </label>
              <input
                type="number"
                id="reservePrice"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Opsiyonel: Minimum kabul edilebilir fiyat
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="minIncrement" className="block text-gray-700 dark:text-gray-300 mb-2">
              Minimum Artış Miktarı (₺) *
            </label>
            <input
              type="number"
              id="minIncrement"
              name="minIncrement"
              value={formData.minIncrement}
              onChange={handleChange}
              min="1"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="startTime" className="block text-gray-700 dark:text-gray-300 mb-2">
                Başlangıç Zamanı *
              </label>
              <DatePicker
                selected={formData.startTime}
                onChange={handleStartDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                minDate={new Date()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-gray-700 dark:text-gray-300 mb-2">
                Bitiş Zamanı *
              </label>
              <DatePicker
                selected={formData.endTime}
                onChange={handleEndDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                minDate={formData.startTime}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              {isEditing ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}