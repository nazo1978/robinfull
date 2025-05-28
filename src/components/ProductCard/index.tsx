'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import Countdown from '@/components/Countdown';
import { Product } from '@/shared/types';
import { useCart } from '@/shared/context/CartContext';
import { formatTitle, formatDescription } from '@/utils/textFormatting';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Ürün verilerini normalize et
      const normalizedProduct = {
        ...product,
        id: product._id || product.id,
        _id: product._id || product.id
      };

      addItem(normalizedProduct, 1);
      console.log('ProductCard: Ürün sepete eklendi', normalizedProduct);
    } catch (error) {
      console.error('ProductCard: Sepete ekleme hatası:', error);
    }
  };

  return (
    <Link href={`/products/${product._id || product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 w-full">
          <SafeImage
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackText="Resim yok"
          />
          {product.discountPercentage && product.discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              %{product.discountPercentage} İndirim
            </div>
          )}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-bold mb-1 line-clamp-2 uppercase">{formatTitle(product.name)}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{formatDescription(product.description)}</p>

          <div className="mt-auto">
            {product.hasCountdown && product.countdownEndsAt && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Kampanya Bitimine:</p>
                <Countdown targetDate={product.countdownEndsAt} compact />
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <div className="flex flex-col">
                    <span className="text-gray-400 line-through text-sm">
                      {product.originalPrice.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="font-bold text-lg">
                      {product.price.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-lg">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Sepete Ekle"
              >
                <FiShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;