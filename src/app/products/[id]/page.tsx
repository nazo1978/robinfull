'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiShoppingCart, FiArrowLeft, FiHeart, FiShare2 } from 'react-icons/fi';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Countdown from '@/components/Countdown';
import DynamicPricing from '@/components/DynamicPricing';
import ProductDynamicPricing from '@/components/ProductDynamicPricing';
import { ProductReviews } from '@/components/ProductReview/ProductReviews';
import SafeImage from '@/components/SafeImage';
import { useCart } from '@/shared/context/CartContext';
import { usePricing } from '@/shared/context/PricingContext';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { products: pricingProducts } = usePricing();

  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Doğrudan backend API'sine istek at
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Ürün bulunamadı');
        const data = await res.json();

        // API'nin döndürdüğü yapıya göre ürünü al
        const productData = data.product || data;

        // Ürünü kontrol et ve gerekli dönüşümleri yap
        const formattedProduct = {
          id: productData._id || productData.id,
          name: productData.name,
          description: productData.description || productData.desc || '',
          price: productData.price,
          originalPrice: productData.originalPrice || productData.price,
          discountPercentage: productData.discountPercentage || 0,
          image: productData.images && productData.images.length > 0
            ? productData.images[0].url
            : 'https://picsum.photos/400/300',
          images: productData.images
            ? productData.images.map((img: any) => img.url || img)
            : ['https://picsum.photos/400/300'],
          category: productData.category,
          stock: productData.stock || 10,
          createdAt: new Date(productData.createdAt),
          updatedAt: new Date(productData.updatedAt),
          rating: productData.rating || 4.5,
          numReviews: productData.numReviews || 0,
          featured: productData.featured || false,
          // Dinamik fiyatlandırma bilgileri
          hasDynamicPricing: productData.hasDynamicPricing || false,
          dynamicPricing: productData.dynamicPricing || null,
          details: productData.details || {
            specifications: [
              { name: 'Marka', value: 'Apple' },
              { name: 'Model', value: productData.name },
              { name: 'Garanti', value: '2 Yıl' },
              { name: 'Stok Kodu', value: productData._id || productData.id }
            ],
            features: [
              'Yüksek performans',
              'Uzun pil ömrü',
              'Dayanıklı tasarım',
              'Kullanıcı dostu arayüz'
            ]
          }
        };

        console.log('Formatlanan ürün detayı:', formattedProduct);
        setProduct(formattedProduct);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
        console.error('Ürün detayı yüklenirken hata:', err);

        // Hata durumunda örnek ürün göster
        const fallbackProduct = {
          id: '1',
          name: 'iPhone 15 Pro',
          description: 'Apple\'ın en yeni amiral gemisi telefonu. A17 Pro işlemci, 48MP kamera sistemi ve titanyum çerçeve ile güçlendirilmiş premium akıllı telefon. Uzun pil ömrü ve gelişmiş kamera özellikleri ile fotoğraf tutkunları için ideal.',
          price: 42999,
          originalPrice: 45999,
          discountPercentage: 6,
          image: 'https://picsum.photos/id/1/400/300',
          images: ['https://picsum.photos/id/1/400/300', 'https://picsum.photos/id/2/400/300', 'https://picsum.photos/id/3/400/300'],
          category: 'electronics',
          stock: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
          rating: 4.8,
          numReviews: 42,
          featured: true,
          details: {
            specifications: [
              { name: 'Marka', value: 'Apple' },
              { name: 'Model', value: 'iPhone 15 Pro' },
              { name: 'Garanti', value: '2 Yıl' },
              { name: 'Stok Kodu', value: '1' }
            ],
            features: [
              'Yüksek performans',
              'Uzun pil ömrü',
              'Dayanıklı tasarım',
              'Kullanıcı dostu arayüz'
            ]
          }
        };

        setProduct(fallbackProduct);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Dinamik fiyatlandırma verisini kontrol etme - backend'den gelen veriye göre
  const hasDynamicPricing = product?.hasDynamicPricing || false;

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Ürün bulunamadı</h1>
      <Link href="/products" className="text-blue-500 flex items-center mt-4">
        <FiArrowLeft className="mr-2" /> Ürünlere geri dön
      </Link>
    </div>
  );

  const details = product.details;
  const images = product.images || [product.image];

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log('handleAddToCart çağrıldı');
    console.log('Product data:', product);
    console.log('Quantity:', quantity);
    console.log('addItem function:', addItem);

    if (!product) {
      console.error('Product verisi yok');
      alert('Ürün bilgileri yüklenemedi.');
      return;
    }

    if (!addItem) {
      console.error('addItem fonksiyonu yok');
      alert('Sepet servisi kullanılamıyor.');
      return;
    }

    try {
      // Cart context'in beklediği format
      const cartProduct = {
        id: product._id || product.id, // Backend'den _id gelir
        _id: product._id || product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.discountPercentage || 0,
        image: product.images?.[0] || product.image,
        images: product.images || [product.image],
        category: product.category,
        stock: product.stock,
        rating: product.rating || 0,
        numReviews: product.numReviews || 0
      };

      console.log('Sepete eklenen ürün:', cartProduct);
      console.log('Mevcut ürün verisi:', product);

      addItem(cartProduct, quantity);
      console.log('addItem çağrıldı');

      // Başarı mesajı göster
      alert(`${product.name} sepete eklendi!`);
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken bir hata oluştu: ' + error.message);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    // Burada backend'e like isteği gönderebilirsiniz
    // fetch(`/api/products/${id}/like`, { method: 'POST' })
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: URL'yi kopyala
        await navigator.clipboard.writeText(window.location.href);
        alert('Ürün linki kopyalandı!');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      // Fallback: URL'yi kopyala
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Ürün linki kopyalandı!');
      } catch (clipboardError) {
        console.error('Kopyalama hatası:', clipboardError);
      }
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }

    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href="/products" className="flex items-center text-gray-600 hover:text-black mb-6">
        <FiArrowLeft className="mr-2" /> Ürünlere geri dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Ürün Görselleri */}
        <div>
          <div className="relative h-96 w-full mb-4 overflow-hidden rounded-lg">
            <SafeImage
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              fallbackText="Resim yok"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-24 cursor-pointer rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-black' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <SafeImage src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 transition-colors ${
                  isLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-red-500'
                }`}
                title={isLiked ? 'Beğeniyi kaldır' : 'Beğen'}
              >
                <FiHeart className={isLiked ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Paylaş"
              >
                <FiShare2 />
              </button>
            </div>
          </div>

          {/* Yıldız Değerlendirme ve Beğeni */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                ({product.rating}) • {product.numReviews} değerlendirme
              </span>
            </div>
            {likeCount > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <FiHeart className="w-4 h-4" />
                <span>{likeCount} beğeni</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center flex-wrap gap-2">
            <span className="text-2xl font-bold">{product.price.toLocaleString('tr-TR')} ₺</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                {product.originalPrice.toLocaleString('tr-TR')} ₺
              </span>
            )}
            {product.discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-md font-semibold">
                %{product.discountPercentage} İndirim
              </span>
            )}
          </div>

          <p className="mt-4 text-gray-600">{product.description}</p>

          {product.hasCountdown && product.countdownEndsAt && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Kampanya Süresi:</p>
              <Countdown targetDate={product.countdownEndsAt} />
            </div>
          )}

          {/* Dinamik Fiyatlandırma yoksa standart sepete ekleme göster */}
          {!hasDynamicPricing && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <span className="w-24">Stok Durumu:</span>
                <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
                </span>
              </div>

              <div className="flex items-center mb-6">
                <span className="w-24">Adet:</span>
                <div className="flex border border-gray-300 rounded">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={(e) => {
                  console.log('Button clicked!', e);
                  handleAddToCart();
                }}
                disabled={product.stock <= 0}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-500 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="mr-2" />
                {product.stock <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
              </button>
              <div className="mt-2 text-xs text-gray-500">
                Debug: Stock: {product.stock}, Disabled: {product.stock <= 0 ? 'Yes' : 'No'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dinamik Fiyatlandırma */}
      {hasDynamicPricing && (
        <div className="mt-8">
          <ProductDynamicPricing productId={id} product={product} />
        </div>
      )}

      {/* Ürün Detayları */}
      {details && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Ürün Detayları</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Teknik Özellikler */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Teknik Özellikler</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <table className="w-full">
                  <tbody>
                    {details.specifications.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="py-2 px-4 font-medium">{spec.name}</td>
                        <td className="py-2 px-4">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Özellikler */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Öne Çıkan Özellikler</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-2">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ürün Değerlendirmeleri */}
      <ProductReviews
        productId={id}
        initialReviews={[
          {
            id: "1",
            author: "Ahmet Yılmaz",
            date: "15.06.2023",
            rating: 5,
            content: "Harika bir ürün, çok memnun kaldım. Hızlı kargo ve kaliteli paketleme için teşekkürler!",
            avatar: "https://i.pravatar.cc/150?img=1"
          },
          {
            id: "2",
            author: "Ayşe Demir",
            date: "10.06.2023",
            rating: 4,
            content: "Ürün beklediğim gibi çıktı, sadece rengi biraz farklı geldi. Yine de memnunum.",
            avatar: "https://i.pravatar.cc/150?img=5"
          }
        ]}
      />
    </div>
  );
}