'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Fiyat geçmişi için tip tanımlaması
interface PriceHistory {
  date: Date;
  price: number;
}

// Ürün için tip tanımlaması
export interface ProductWithPricing {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  priceHistory: PriceHistory[];
  bulkPricing: {
    enabled: boolean;
    thresholds: { quantity: number; discount: number }[];
  };
  dynamicPricing: {
    enabled: boolean;
    minPrice: number;
    maxPrice: number;
    currentDiscount: number;
  };
}

// Context için tip tanımlaması
interface PricingContextType {
  calculatePrice: (productId: string, quantity: number) => number;
  getBulkDiscountRate: (productId: string, quantity: number) => number;
  getPriceHistory: (productId: string) => PriceHistory[];
  getProductPrice: (productId: string) => number;
  updateProductPrice: (productId: string, newPrice: number) => void;
  products: ProductWithPricing[];
}

// Context oluşturma
const PricingContext = createContext<PricingContextType | undefined>(undefined);

// Mock ürün verileri devre dışı
// const mockProducts: ProductWithPricing[] = [ ... ]; // Mock veri devre dışı

// Provider bileşeni
export const PricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductWithPricing[]>([]);

  // Ürünleri yükleme
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Ürünler alınamadı');
        const data = await res.json();

        // API'nin döndürdüğü yapıya göre ürünleri al
        const productList = data.products || data;

        // Ürünleri kontrol et ve gerekli dönüşümleri yap
        const formattedProducts = productList.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          description: product.description || product.desc || '',
          basePrice: product.price,
          currentPrice: product.price,
          originalPrice: product.originalPrice || product.price,
          discountPercentage: product.discountPercentage || 0,
          // Fiyat geçmişi - backend'den gelecek
          priceHistory: product.priceHistory || [],
          // Toplu alım indirimi - backend'den gelecek
          bulkPricing: product.bulkPricing || {
            enabled: false,
            thresholds: []
          },
          // Dinamik fiyatlandırma - backend'den gelecek
          dynamicPricing: product.dynamicPricing || {
            enabled: false,
            basePrice: product.price,
            currentPrice: product.price,
            minPrice: product.price,
            maxPrice: product.price,
            currentDiscount: 0,
            lastUpdated: new Date()
          }
        }));

        setProducts(formattedProducts);
      } catch (err) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Belirli bir miktar için indirim oranını hesaplama
  const getBulkDiscountRate = (productId: string, quantity: number): number => {
    const product = products.find(p => p.id === productId);

    if (!product || !product.bulkPricing.enabled || quantity < 2) {
      return 0;
    }

    // Miktar eşiğine göre indirim oranını bulma
    const thresholds = product.bulkPricing.thresholds;
    let discountRate = 0;

    for (let i = 0; i < thresholds.length; i++) {
      if (quantity >= thresholds[i].quantity) {
        discountRate = thresholds[i].discount;
      } else {
        break;
      }
    }

    return discountRate;
  };

  // Belirli bir miktar için fiyat hesaplama
  const calculatePrice = (productId: string, quantity: number): number => {
    const product = products.find(p => p.id === productId);

    if (!product) {
      return 0;
    }

    // Birim fiyat
    const unitPrice = product.currentPrice;

    // Toplu alım indirimi
    const bulkDiscountRate = getBulkDiscountRate(productId, quantity);
    const discountedPrice = unitPrice * (1 - bulkDiscountRate / 100);

    // Toplam fiyat
    return discountedPrice * quantity;
  };

  // Ürün fiyat geçmişini alma
  const getPriceHistory = (productId: string): PriceHistory[] => {
    const product = products.find(p => p.id === productId);
    return product ? product.priceHistory : [];
  };

  // Ürünün güncel fiyatını alma
  const getProductPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    return product ? product.currentPrice : 0;
  };

  // Ürün fiyatını güncelleme
  const updateProductPrice = (productId: string, newPrice: number): void => {
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        if (product.id === productId) {
          // Fiyat geçmişine yeni fiyatı ekleme
          const updatedPriceHistory = [
            ...product.priceHistory,
            { date: new Date(), price: newPrice }
          ];

          // Dinamik fiyatlandırma bilgilerini güncelleme
          const discountPercentage = ((product.basePrice - newPrice) / product.basePrice) * 100;

          return {
            ...product,
            currentPrice: newPrice,
            priceHistory: updatedPriceHistory,
            dynamicPricing: {
              ...product.dynamicPricing,
              currentDiscount: parseFloat(discountPercentage.toFixed(1))
            }
          };
        }
        return product;
      });
    });
  };

  return (
    <PricingContext.Provider
      value={{
        calculatePrice,
        getBulkDiscountRate,
        getPriceHistory,
        getProductPrice,
        updateProductPrice,
        products
      }}
    >
      {children}
    </PricingContext.Provider>
  );
};

// Context kullanımı için hook
export const usePricing = () => {
  const context = useContext(PricingContext);

  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }

  return context;
};