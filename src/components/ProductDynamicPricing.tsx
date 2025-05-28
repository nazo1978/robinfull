'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingDown, FiUsers, FiClock, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '@/shared/context/CartContext';

interface DynamicPricingData {
  hasDynamicPricing: boolean;
  basePrice: number;
  currentPrice: number;
  priceIncrement: number;
  maxPrice: number;
  purchaseCount: number;
  quantityThresholds: Array<{
    quantity: number;
    discountPercentage: number;
  }>;
  monthlyDeal?: {
    isMonthlyDeal: boolean;
    startDate: string;
    endDate: string;
    specialDiscountPercentage: number;
  };
}

interface ProductDynamicPricingProps {
  productId: string;
  product: any;
}

export default function ProductDynamicPricing({ productId, product }: ProductDynamicPricingProps) {
  const [dynamicData, setDynamicData] = useState<DynamicPricingData | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchDynamicPricingData();
  }, [productId]);

  const fetchDynamicPricingData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        const productData = data.product || data;
        
        if (productData.hasDynamicPricing) {
          setDynamicData({
            hasDynamicPricing: true,
            basePrice: productData.originalPrice || productData.price,
            currentPrice: productData.price,
            priceIncrement: productData.dynamicPricing?.priceIncrement || 0,
            maxPrice: productData.dynamicPricing?.maxPrice || productData.price * 2,
            purchaseCount: productData.dynamicPricing?.purchaseCount || 0,
            quantityThresholds: productData.dynamicPricing?.quantityThresholds || [],
            monthlyDeal: productData.dynamicPricing?.monthlyDeal
          });
        }
      }
    } catch (error) {
      console.error('Dinamik fiyatlandırma verisi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (quantity: number) => {
    if (!dynamicData) return product.price;

    let discountPercentage = 0;
    
    // Miktar indirimlerini kontrol et
    for (const threshold of dynamicData.quantityThresholds) {
      if (quantity >= threshold.quantity) {
        discountPercentage = Math.max(discountPercentage, threshold.discountPercentage);
      }
    }

    // Aylık kampanya kontrolü
    if (dynamicData.monthlyDeal?.isMonthlyDeal) {
      const now = new Date();
      const startDate = new Date(dynamicData.monthlyDeal.startDate);
      const endDate = new Date(dynamicData.monthlyDeal.endDate);
      
      if (now >= startDate && now <= endDate) {
        discountPercentage = Math.max(discountPercentage, dynamicData.monthlyDeal.specialDiscountPercentage);
      }
    }

    const discountedPrice = dynamicData.currentPrice * (1 - discountPercentage / 100);
    return Math.max(discountedPrice, dynamicData.currentPrice * 0.5); // Minimum %50 fiyat
  };

  const handleAddToCart = () => {
    const finalPrice = calculateDiscountedPrice(selectedQuantity);
    
    const cartProduct = {
      id: product.id,
      _id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.price,
      discountPercentage: Math.round(((product.price - finalPrice) / product.price) * 100),
      image: product.images?.[0] || product.image,
      images: product.images || [product.image],
      category: product.category,
      stock: product.stock,
      rating: product.rating || 0,
      numReviews: product.numReviews || 0
    };

    addItem(cartProduct, selectedQuantity);
    alert(`${product.name} sepete eklendi! (${selectedQuantity} adet - ₺${finalPrice.toLocaleString('tr-TR')})`);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!dynamicData?.hasDynamicPricing) {
    return null;
  }

  const currentDiscountedPrice = calculateDiscountedPrice(selectedQuantity);
  const totalSavings = (product.price * selectedQuantity) - (currentDiscountedPrice * selectedQuantity);
  const discountPercentage = Math.round(((product.price - currentDiscountedPrice) / product.price) * 100);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <FiTrendingDown className="text-blue-600" size={20} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Dinamik Fiyatlandırma Aktif</h3>
      </div>

      <p className="text-gray-600 mb-6">
        Bu ürün dinamik fiyatlandırma sistemine dahildir. Satın alma miktarınıza göre daha fazla indirim kazanabilirsiniz!
      </p>

      {/* Miktar Seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Miktar Seçin:
        </label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={selectedQuantity <= 1}
          >
            -
          </button>
          <span className="px-4 py-2 border border-gray-300 rounded-md bg-white min-w-[60px] text-center">
            {selectedQuantity}
          </span>
          <button
            onClick={() => setSelectedQuantity(Math.min(product.stock, selectedQuantity + 1))}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={selectedQuantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      {/* Fiyat Bilgileri */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Birim Fiyat</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">
                ₺{currentDiscountedPrice.toLocaleString('tr-TR')}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₺{product.price.toLocaleString('tr-TR')}
                </span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="text-sm text-green-600 font-medium">
                %{discountPercentage} indirim
              </span>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Toplam Fiyat</p>
            <span className="text-2xl font-bold text-blue-600">
              ₺{(currentDiscountedPrice * selectedQuantity).toLocaleString('tr-TR')}
            </span>
            {totalSavings > 0 && (
              <p className="text-sm text-green-600 font-medium">
                ₺{totalSavings.toLocaleString('tr-TR')} tasarruf
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Miktar İndirimleri */}
      {dynamicData.quantityThresholds.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <FiUsers className="mr-2" />
            Miktar İndirimleri
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {dynamicData.quantityThresholds.map((threshold, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border text-center ${
                  selectedQuantity >= threshold.quantity
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="font-medium">{threshold.quantity}+ adet</div>
                <div className="text-sm">%{threshold.discountPercentage} indirim</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aylık Kampanya */}
      {dynamicData.monthlyDeal?.isMonthlyDeal && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2 flex items-center">
            <FiClock className="mr-2" />
            Aylık Özel Kampanya
          </h4>
          <p className="text-sm text-orange-800">
            %{dynamicData.monthlyDeal.specialDiscountPercentage} ek indirim! 
            Kampanya {new Date(dynamicData.monthlyDeal.endDate).toLocaleDateString('tr-TR')} tarihine kadar geçerli.
          </p>
        </div>
      )}

      {/* Sepete Ekle Butonu */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <FiShoppingCart className="mr-2" />
        {product.stock <= 0 ? 'Stokta Yok' : `Sepete Ekle (${selectedQuantity} adet)`}
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Dinamik fiyatlandırma sistemi ile daha fazla alarak daha fazla tasarruf edin!
      </div>
    </div>
  );
}
