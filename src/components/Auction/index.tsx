'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Auction as AuctionType } from '@/shared/types';
import Countdown from '../Countdown';
import { FiUser, FiDollarSign, FiInfo } from 'react-icons/fi';

interface AuctionProps {
  auction: AuctionType;
  onPlaceBid: (auctionId: string, amount: number) => Promise<void>;
  currentUserId?: string;
}

const Auction: React.FC<AuctionProps> = ({
  auction,
  onPlaceBid,
  currentUserId,
}) => {
  const [bidAmount, setBidAmount] = useState<number>(
    auction.currentPrice + auction.minBidIncrement
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bidAmount < auction.currentPrice + auction.minBidIncrement) {
      setError(`Minimum teklif ${auction.currentPrice + auction.minBidIncrement} ₺ olmalıdır`);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      await onPlaceBid(auction.id, bidAmount);
      // Reset form after successful bid
      setBidAmount(auction.currentPrice + auction.minBidIncrement);
    } catch (err) {
      setError('Teklif verilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighestBidder = 
    currentUserId && 
    auction.highestBidder && 
    auction.highestBidder.id === currentUserId;

  const handleCountdownComplete = () => {
    // Handle auction end logic
  };

  const imageUrl = auction.product.image || 'default-image-url.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64 w-full">
        <Image
          src={imageUrl}
          alt={auction.product.name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{auction.product.name}</h2>
        <p className="text-gray-600 mb-4">{auction.product.description}</p>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <Countdown targetDate={auction.endsAt} />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-500">Mevcut Fiyat</span>
            <div className="text-2xl font-bold">{auction.currentPrice.toFixed(2)} ₺</div>
          </div>
          
          {auction.highestBidder && (
            <div className="flex items-center text-sm">
              <FiUser className="mr-1" />
              <span className="text-gray-600">
                {isHighestBidder ? 'Sizin teklifiniz önde!' : `En yüksek teklif: ${auction.highestBidder.name}`}
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="flex items-center text-sm mb-2">
            <FiInfo className="mr-1 text-blue-500" />
            <span>Minimum teklif artırımı: {auction.minBidIncrement} ₺</span>
          </div>
          
          <form onSubmit={handleBidSubmit}>
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="text-gray-400" />
                </div>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                  min={auction.currentPrice + auction.minBidIncrement}
                  step="0.01"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-black focus:border-black"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 disabled:bg-gray-400"
              >
                {isSubmitting ? 'İşleniyor...' : 'Teklif Ver'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </form>
        </div>
        
        <h3 className="font-semibold mb-2">Son Teklifler</h3>
        {auction.bids.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {auction.bids.slice(0, 5).map((bid) => (
              <li key={bid.id} className="py-2 flex justify-between">
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-400" />
                  <span className="text-sm">
                    {bid.user.id === currentUserId ? 'Siz' : bid.user.name}
                  </span>
                </div>
                <div>
                  <span className="font-medium">{bid.amount.toFixed(2)} ₺</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(bid.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Henüz teklif yapılmamış</p>
        )}
      </div>
    </div>
  );
};

export default Auction; 