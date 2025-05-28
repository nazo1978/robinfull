'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiFilter, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import { Product } from '@/shared/types';
import { formatTitle, formatDescription } from '@/utils/textFormatting';

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Search parametresi varsa URL'ye ekle
        let apiUrl = '/api/products';
        if (searchQuery) {
          apiUrl += `?search=${encodeURIComponent(searchQuery)}`;
        }

        // API isteğini göreceli URL ile yap (Next.js API Routes kullanılıyorsa)
        const res = await fetch(apiUrl);

        if (!res.ok) {
          // Eğer API isteği başarısız olursa, önce backend API'sine doğrudan istek dene
          const backendRes = await fetch('http://localhost:5000/api/products');

          if (!backendRes.ok) {
            throw new Error('Ürünler alınamadı');
          }

          const data = await backendRes.json();
          processProductData(data);
          return;
        }

        const data = await res.json();
        processProductData(data);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
        console.error('Ürünler yüklenirken hata:', err);

        // Hata durumunda örnek ürünler göster
        const fallbackProducts = [
          {
            id: '1',
            name: 'iPhone 15 Pro',
            description: 'Apple\'ın en yeni amiral gemisi telefonu',
            price: 42999,
            originalPrice: 45999,
            discountPercentage: 6,
            image: 'https://picsum.photos/id/1/400/300',
            images: ['https://picsum.photos/id/1/400/300', 'https://picsum.photos/id/2/400/300'],
            category: 'electronics',
            stock: 15,
            createdAt: new Date(),
            updatedAt: new Date(),
            rating: 4.8,
            numReviews: 42,
            featured: true,
          },
          {
            id: '2',
            name: 'Samsung Galaxy S24 Ultra',
            description: 'Samsung\'un en güçlü telefonu',
            price: 39999,
            originalPrice: 41999,
            discountPercentage: 5,
            image: 'https://picsum.photos/id/3/400/300',
            images: ['https://picsum.photos/id/3/400/300', 'https://picsum.photos/id/4/400/300'],
            category: 'electronics',
            stock: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
            rating: 4.7,
            numReviews: 38,
            featured: true,
          }
        ];

        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  // API'den gelen ürün verilerini işle
  const processProductData = (data: any) => {
    // API'nin döndürdüğü yapıya göre ürünleri al
    const productList = data.products || data;

    // Ürünleri kontrol et ve gerekli dönüşümleri yap
    const formattedProducts = productList.map((product: any) => ({
      id: product._id || product.id,
      name: product.name,
      description: product.description || product.desc || '',
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      discountPercentage: product.discountPercentage || 0,
      image: product.images && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
        : 'https://picsum.photos/400/300',
      images: product.images
        ? product.images.map((img: any) => typeof img === 'string' ? img : (img.url || img))
        : ['https://picsum.photos/400/300'],
      category: product.category,
      stock: product.stock || 10,
      createdAt: new Date(product.createdAt || Date.now()),
      updatedAt: new Date(product.updatedAt || Date.now()),
      rating: product.rating || 4.5,
      numReviews: product.numReviews || 0,
      featured: product.featured || false,
    }));

    console.log('Formatlanan ürünler:', formattedProducts);
    setProducts(formattedProducts);
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold">
            {searchQuery ? `"${searchQuery}" için arama sonuçları` : 'Ürünler'}
          </h1>
          {searchQuery && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {products.length} ürün bulundu
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100'}`}
          >
            <FiGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100'}`}
          >
            <FiList size={20} />
          </button>
          <button
            className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-md"
          >
            <FiFilter size={18} />
            <span>Filtrele</span>
          </button>
          <div className="relative">
            <Cart />
          </div>
        </div>
      </div>

      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}