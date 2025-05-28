'use client';

import React, { useState } from 'react';
import { FiTrendingDown, FiBarChart2, FiInfo, FiShoppingCart } from 'react-icons/fi';
import { usePricing } from '@/shared/context/PricingContext';
import { useCart } from '@/shared/context/CartContext';

interface DynamicPricingProps {
  productId: string;
}

const DynamicPricing: React.FC<DynamicPricingProps> = ({ productId }) => {
  const { products, calculatePrice, getBulkDiscountRate, getPriceHistory } = usePricing();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  const product = products.find(p => p.id === productId);

  if (!product) {
    return null;
  }

  // Ürünün gerekli özelliklere sahip olduğundan emin ol
  if (!product.dynamicPricing) {
    return null;
  }

  if (!product.bulkPricing) {
    return null;
  }

  const bulkDiscountRate = getBulkDiscountRate(productId, quantity);
  const totalPrice = calculatePrice(productId, quantity);
  const priceHistory = getPriceHistory(productId);

  // Fiyat geçmişini tarihe göre sıralama
  const sortedPriceHistory = [...priceHistory].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Sepete ekle fonksiyonu
  const handleAddToCart = () => {
    console.log('DynamicPricing handleAddToCart çağrıldı');
    console.log('Product:', product);
    console.log('Quantity:', quantity);

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
        id: product.id,
        _id: product.id,
        name: product.name,
        price: totalPrice / quantity, // Birim fiyat (indirimli)
        originalPrice: product.basePrice,
        discountPercentage: bulkDiscountRate,
        image: product.image || '',
        images: product.images || [],
        category: product.category || '',
        stock: product.stock || 999,
        rating: product.rating || 0,
        numReviews: product.numReviews || 0
      };

      console.log('DynamicPricing: Sepete eklenen ürün:', cartProduct);

      addItem(cartProduct, quantity);
      console.log('DynamicPricing: addItem çağrıldı');

      // Başarı mesajı göster
      alert(`${product.name} (${quantity} adet) sepete eklendi!`);
    } catch (error) {
      console.error('DynamicPricing: Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken bir hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Dinamik Fiyatlandırma</h3>
        <div className="flex items-center text-green-600">
          <FiTrendingDown className="mr-1" />
          <span>%{product.dynamicPricing.currentDiscount} indirim</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Bu ürün dinamik fiyatlandırma ile satılmaktadır. Fiyatlar talebe göre değişiklik gösterebilir.
        </p>

        <div className="flex items-center mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{
                width: `${((product.basePrice - product.currentPrice) / (product.basePrice - product.dynamicPricing.minPrice)) * 100}%`
              }}
            ></div>
          </div>
          <div className="ml-4 text-sm text-gray-500 whitespace-nowrap">
            {product.dynamicPricing.minPrice.toLocaleString()} ₺ - {product.dynamicPricing.maxPrice.toLocaleString()} ₺
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <h4 className="font-medium mb-3">Toplu Alım İndirimi</h4>

        {product.bulkPricing.enabled ? (
          <>
            <p className="text-gray-600 mb-4">
              Daha fazla alın, daha fazla tasarruf edin! Aşağıdaki miktarlarda indirim kazanın:
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {product.bulkPricing.thresholds.map((threshold, index) => (
                <div
                  key={index}
                  className={`text-center p-2 border rounded-md ${quantity >= threshold.quantity ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="font-medium">{threshold.quantity}+ adet</div>
                  <div className="text-sm text-green-600">%{threshold.discount} indirim</div>
                </div>
              ))}
            </div>

            <div className="flex items-center mb-4">
              <div className="mr-4">
                <label htmlFor="quantity" className="block text-sm text-gray-600 mb-1">
                  Miktar
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center py-1 border-t border-b border-gray-300"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {bulkDiscountRate > 0 && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm">
                  %{bulkDiscountRate} toplu alım indirimi
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Toplam Fiyat:</div>
                <div className="text-2xl font-bold">{totalPrice.toLocaleString()} ₺</div>
                {bulkDiscountRate > 0 && (
                  <div className="text-sm text-gray-500">
                    Birim fiyat: {(totalPrice / quantity).toLocaleString()} ₺
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center"
              >
                <FiShoppingCart className="mr-2" />
                Sepete Ekle
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Bu ürün için toplu alım indirimi bulunmamaktadır.</p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowPriceHistory(!showPriceHistory)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiBarChart2 className="mr-2" />
          {showPriceHistory ? 'Fiyat Geçmişini Gizle' : 'Fiyat Geçmişini Göster'}
        </button>

        {showPriceHistory && (
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h5 className="font-medium mb-3">Fiyat Geçmişi</h5>

              <div className="relative h-40">
                <div className="absolute inset-0">
                  <svg width="100%" height="100%" className="overflow-visible">
                    {/* Eksen çizgileri */}
                    <line x1="40" y1="10" x2="40" y2="130" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="40" y1="130" x2="100%" y2="130" stroke="#e5e7eb" strokeWidth="1" />

                    {/* Fiyat çizgisi */}
                    {sortedPriceHistory.length > 1 && (
                      <polyline
                        points={sortedPriceHistory.map((point, index) => {
                          const xPos = 40 + (index * ((100 - 40) / (sortedPriceHistory.length - 1)));
                          const maxPrice = Math.max(...sortedPriceHistory.map(p => p.price));
                          const minPrice = Math.min(...sortedPriceHistory.map(p => p.price));
                          const range = maxPrice - minPrice || 1;
                          const yPos = 130 - ((point.price - minPrice) / range * 100);
                          return `${xPos},${yPos}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                    )}

                    {/* Fiyat noktaları */}
                    {sortedPriceHistory.map((point, index) => {
                      const xPos = 40 + (index * ((100 - 40) / (sortedPriceHistory.length - 1)));
                      const maxPrice = Math.max(...sortedPriceHistory.map(p => p.price));
                      const minPrice = Math.min(...sortedPriceHistory.map(p => p.price));
                      const range = maxPrice - minPrice || 1;
                      const yPos = 130 - ((point.price - minPrice) / range * 100);
                      return (
                        <circle
                          key={index}
                          cx={xPos}
                          cy={yPos}
                          r="4"
                          fill="#10b981"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                {sortedPriceHistory.length > 0 && (
                  <>
                    <div>{new Date(sortedPriceHistory[0].date).toLocaleDateString('tr-TR')}</div>
                    {sortedPriceHistory.length > 1 && (
                      <div>{new Date(sortedPriceHistory[sortedPriceHistory.length - 1].date).toLocaleDateString('tr-TR')}</div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-600 flex items-center mb-1">
                  <FiInfo className="mr-1" size={14} />
                  <span>Son 90 gün içindeki en düşük fiyat: {Math.min(...priceHistory.map(p => p.price)).toLocaleString()} ₺</span>
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <FiInfo className="mr-1" size={14} />
                  <span>Son 90 gün içindeki en yüksek fiyat: {Math.max(...priceHistory.map(p => p.price)).toLocaleString()} ₺</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPricing;