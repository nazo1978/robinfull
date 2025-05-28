'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiLock, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '@/shared/context/CartContext';
import { useAuth } from '@/shared/context/AuthContext';

// Gerçek sepet verileri CartContext'ten alınacak

// Kargo seçenekleri
const shippingOptions = [
  { id: 'standard', name: 'Standart Kargo', price: 0, duration: '3-5 iş günü' },
  { id: 'express', name: 'Hızlı Kargo', price: 29.99, duration: '1-2 iş günü' },
  { id: 'same-day', name: 'Aynı Gün Teslimat', price: 49.99, duration: 'Bugün' },
];

// Ödeme yöntemleri
const paymentMethods = [
  { id: 'credit-card', name: 'Kredi Kartı', icon: FiCreditCard },
  { id: 'bank-transfer', name: 'Havale/EFT', icon: FiCreditCard },
  { id: 'pay-at-door', name: 'Kapıda Ödeme', icon: FiCreditCard },
];

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'address' | 'payment' | 'confirmation'>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Kart numarası formatlaması
    if (name === 'cardNumber') {
      // Sadece rakamları al ve 16 haneli yap
      const numbers = value.replace(/\D/g, '');
      const formatted = numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (numbers.length <= 16) {
        setFormData(prev => ({
          ...prev,
          [name]: formatted
        }));
      }
      return;
    }

    // Son kullanma tarihi formatlaması
    if (name === 'expiryDate') {
      const numbers = value.replace(/\D/g, '');
      let formatted = numbers;
      if (numbers.length >= 2) {
        formatted = numbers.substring(0, 2) + '/' + numbers.substring(2, 4);
      }
      if (numbers.length <= 4) {
        setFormData(prev => ({
          ...prev,
          [name]: formatted
        }));
      }
      return;
    }

    // CVV formatlaması
    if (name === 'cvv') {
      const numbers = value.replace(/\D/g, '').substring(0, 3);
      setFormData(prev => ({
        ...prev,
        [name]: numbers
      }));
      return;
    }

    // Telefon formatlaması
    if (name === 'phone') {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: numbers
        }));
      }
      return;
    }

    // Posta kodu formatlaması
    if (name === 'postalCode') {
      const numbers = value.replace(/\D/g, '').substring(0, 5);
      setFormData(prev => ({
        ...prev,
        [name]: numbers
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Adres bilgileri kontrolü
    if (!formData.firstName.trim()) errors.push('Ad alanı zorunludur');
    if (!formData.lastName.trim()) errors.push('Soyad alanı zorunludur');
    if (!formData.email.trim()) errors.push('E-posta alanı zorunludur');
    if (!formData.phone.trim()) errors.push('Telefon alanı zorunludur');
    if (!formData.address.trim()) errors.push('Adres alanı zorunludur');
    if (!formData.city.trim()) errors.push('Şehir alanı zorunludur');
    if (!formData.postalCode.trim()) errors.push('Posta kodu alanı zorunludur');

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }

    // Telefon kontrolü
    if (formData.phone && formData.phone.length < 10) {
      errors.push('Telefon numarası en az 10 haneli olmalıdır');
    }

    // Kart bilgileri kontrolü
    if (!formData.cardNumber.trim()) errors.push('Kart numarası zorunludur');
    if (!formData.cardName.trim()) errors.push('Kart üzerindeki isim zorunludur');
    if (!formData.expiryDate.trim()) errors.push('Son kullanma tarihi zorunludur');
    if (!formData.cvv.trim()) errors.push('CVV kodu zorunludur');

    // Kart numarası kontrolü (sadece rakamlar)
    const cardNumbers = formData.cardNumber.replace(/\s/g, '');
    if (cardNumbers && cardNumbers.length !== 16) {
      errors.push('Kart numarası 16 haneli olmalıdır');
    }

    // CVV kontrolü
    if (formData.cvv && formData.cvv.length !== 3) {
      errors.push('CVV kodu 3 haneli olmalıdır');
    }

    // Son kullanma tarihi kontrolü
    if (formData.expiryDate && formData.expiryDate.length !== 5) {
      errors.push('Son kullanma tarihi AA/YY formatında olmalıdır');
    }

    return errors;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Form validasyonu
      console.log('Checkout - FormData:', formData);
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }
      // Token'ı cookie'den al
      const authTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));

      const token = authTokenCookie ? authTokenCookie.split('=')[1] : '';

      if (!token) {
        router.push('/auth/login?redirect=' + encodeURIComponent('/checkout'));
        return;
      }

      // Sipariş verilerini hazırla
      console.log('Checkout - Sepet items:', items);
      console.log('Checkout - Items length:', items.length);

      if (items.length === 0) {
        throw new Error('Sepetinizde ürün bulunmamaktadır');
      }

      const orderItems = items.map((item, index) => {
        console.log(`Checkout - Item ${index}:`, item);
        console.log(`Checkout - Item ${index} product:`, item.product);
        console.log(`Checkout - Item ${index} quantity:`, item.quantity);

        if (!item.product) {
          throw new Error(`Sepet öğesi ${index + 1} için ürün bilgisi eksik`);
        }

        if (!item.product.id) {
          throw new Error(`Sepet öğesi ${index + 1} için ürün ID'si eksik`);
        }

        return {
          product: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image
        };
      });
      console.log('Checkout - OrderItems:', orderItems);

      const orderData = {
        orderItems,
        shipping: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: 'Türkiye', // Varsayılan ülke
          phone: formData.phone
        },
        payment: {
          method: 'credit_card', // Schema'daki enum değeri
          status: 'pending'
        },
        itemsPrice: totalPrice,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: totalPrice,
        // Ek bilgiler (sipariş notları olarak)
        customerInfo: {
          email: formData.email,
          cardName: formData.cardName,
          cardLastFour: formData.cardNumber.replace(/\s/g, '').slice(-4)
        }
      };

      console.log('Checkout - OrderData:', JSON.stringify(orderData, null, 2));

      // Backend'e sipariş gönder
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sipariş oluşturulurken bir hata oluştu');
      }

      // Başarılı sipariş sonrası
      setOrderId(data.order._id);
      setOrderComplete(true);
      clearCart();

    } catch (error) {
      console.error('Sipariş oluşturma hatası:', error);
      alert('Sipariş oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Kullanıcı login değilse login sayfasına yönlendir
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/checkout'));
    }
  }, [user, router]);

  if (orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-green-50 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FiCheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Siparişiniz Alındı</h1>
          <p className="text-gray-600 mb-6">
            Siparişiniz başarıyla oluşturuldu. Sipariş numaranız: <strong>{orderId}</strong>
          </p>
          <p className="text-gray-600 mb-8">
            Siparişinizle ilgili detayları e-posta adresinize gönderdik. Sipariş durumunuzu hesabınızdan takip edebilirsiniz.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Ödeme</h1>
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <p className="text-gray-600 mb-6">Sepetinizde ürün bulunmamaktadır.</p>
          <Link
            href="/products"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="mr-2" /> Alışverişe devam et
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Link
        href="/cart"
        className="inline-flex items-center text-gray-600 hover:text-black mb-8"
      >
        <FiArrowLeft className="mr-2" /> Sepete Dön
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'address' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                1
              </div>
              <div className="h-1 w-12 bg-gray-200 mx-2"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                2
              </div>
            </div>

            {step === 'address' && (
              <form onSubmit={handleAddressSubmit}>
                <h2 className="text-xl font-semibold mb-6">Teslimat Bilgileri</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="5321234567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Ödeme Adımına Geç
                  </button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit}>
                <h2 className="text-xl font-semibold mb-6">Ödeme Bilgileri</h2>

                <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <FiLock className="text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Güvenli Ödeme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</div>
                    <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">MC</div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Kart Numarası
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength={19}
                      required
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                    <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Son Kullanma Tarihi
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="AA/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      maxLength={5}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleChange}
                      maxLength={3}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      id="saveCard"
                      name="saveCard"
                      type="checkbox"
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                      Kart bilgilerimi sonraki alışverişler için kaydet
                    </label>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
                  <p>
                    Ödeme bilgileriniz güvenli bir şekilde işlenir. Kart bilgileriniz bizimle paylaşılmaz ve
                    SSL sertifikası ile korunur. <a href="#" className="text-blue-600 hover:underline">Gizlilik politikamızı</a> okuyun.
                  </p>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="md:w-1/3 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="md:w-2/3 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        İşleniyor...
                      </>
                    ) : (
                      'Ödemeyi Tamamla'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-4">Sipariş Özeti</h2>

            <div className="max-h-64 overflow-auto mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex py-3 border-b border-gray-100">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="text-sm font-medium">{item.product.name}</h4>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{item.quantity} adet</span>
                      <span className="text-sm font-medium">
                        {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ürün Toplamı ({totalItems} ürün)</span>
                <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo</span>
                <span>Ücretsiz</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Toplam</span>
                <span className="font-bold text-lg">{totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}