'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useGiveaway } from '@/shared/context/GiveawayContext';

export default function GiveawayHighlight() {
  const { activeGiveaways, formatTimeRemaining } = useGiveaway();
  
  // Sadece en yakın bitiş tarihine sahip olan çekilişi göster
  const featuredGiveaway = activeGiveaways.length > 0 
    ? activeGiveaways.sort((a, b) => a.endDate.getTime() - b.endDate.getTime())[0] 
    : null;
  
  if (!featuredGiveaway) return null;
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Aktif Çekiliş</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <Image
                src={featuredGiveaway.image}
                alt={featuredGiveaway.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-3">{featuredGiveaway.title}</h3>
                <p className="text-gray-600 mb-6">{featuredGiveaway.description}</p>
                
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-medium mb-2">Çekiliş Ödülü</h4>
                  <p className="text-lg font-semibold">{featuredGiveaway.prize}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-orange-500">
                    <FiClock className="mr-2" />
                    <span>{formatTimeRemaining(featuredGiveaway.endDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <FiUsers className="mr-2" />
                    <span>{featuredGiveaway.participants} katılımcı</span>
                  </div>
                </div>
              </div>
              
              <Link 
                href="/giveaways" 
                className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors mt-4"
              >
                Çekilişe Katıl <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link 
            href="/giveaways"
            className="inline-flex items-center text-gray-700 hover:text-black"
          >
            Tüm Çekilişleri Gör <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
} 