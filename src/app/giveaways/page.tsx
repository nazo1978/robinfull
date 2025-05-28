'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiClock, FiUsers, FiGift, FiAward, FiCheckCircle } from 'react-icons/fi';
import { useGiveaway, Giveaway } from '@/shared/context/GiveawayContext';

export default function GiveawaysPage() {
  const { 
    activeGiveaways, 
    completedGiveaways, 
    participateInGiveaway, 
    isParticipating,
    formatTimeRemaining
  } = useGiveaway();
  
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null);

  const handleGiveawaySelect = (giveaway: Giveaway) => {
    setSelectedGiveaway(giveaway);
    window.scrollTo(0, 0);
  };

  const handleParticipate = (giveawayId: string) => {
    participateInGiveaway(giveawayId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <Link 
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-black mb-8"
      >
        <FiArrowLeft className="mr-2" /> Ana Sayfaya Dön
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Çekilişler</h1>
      
      {selectedGiveaway ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <button 
            onClick={() => setSelectedGiveaway(null)}
            className="p-4 text-gray-600 hover:text-black"
          >
            <FiArrowLeft /> Çekilişlere Dön
          </button>
          
          <div className="relative h-72 w-full">
            <Image
              src={selectedGiveaway.image}
              alt={selectedGiveaway.title}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedGiveaway.title}</h2>
              
              {selectedGiveaway.status === 'active' ? (
                <div className="mt-2 md:mt-0 flex items-center text-orange-500">
                  <FiClock className="mr-2" />
                  <span>{formatTimeRemaining(selectedGiveaway.endDate)}</span>
                </div>
              ) : (
                <div className="mt-2 md:mt-0 flex items-center text-green-500">
                  <FiAward className="mr-2" />
                  <span>Kazanan: {selectedGiveaway.winner}</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">{selectedGiveaway.description}</p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-2">Çekiliş Ödülü</h3>
              <p className="text-lg font-semibold">{selectedGiveaway.prize}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-2">Çekiliş Kuralları</h3>
              <p>{selectedGiveaway.rules}</p>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-gray-600">
                <FiUsers className="mr-2" />
                <span>{selectedGiveaway.participants} katılımcı</span>
              </div>
              
              <div>
                {selectedGiveaway.status === 'active' && (
                  isParticipating(selectedGiveaway.id) ? (
                    <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md">
                      <FiCheckCircle className="mr-2" /> Katıldınız
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleParticipate(selectedGiveaway.id)}
                      className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Çekilişe Katıl
                    </button>
                  )
                )}
              </div>
            </div>
            
            {selectedGiveaway.status === 'active' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium mb-4">Canlı Çekiliş</h3>
                <p className="text-gray-600 mb-4">
                  Çekiliş {selectedGiveaway.endDate.toLocaleDateString('tr-TR')} tarihinde canlı olarak gerçekleştirilecektir.
                </p>
                <button className="px-6 py-2 border border-black text-black rounded-md hover:bg-gray-100 transition-colors">
                  Hatırlatıcı Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Aktif Çekilişler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGiveaways.map(giveaway => (
                <div 
                  key={giveaway.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleGiveawaySelect(giveaway)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={giveaway.image}
                      alt={giveaway.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{giveaway.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{giveaway.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-orange-500 text-sm">
                        <FiClock className="mr-1" />
                        <span>{formatTimeRemaining(giveaway.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <FiUsers className="mr-1" />
                        <span>{giveaway.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-6">Tamamlanan Çekilişler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedGiveaways.map(giveaway => (
                <div 
                  key={giveaway.id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow opacity-80"
                  onClick={() => handleGiveawaySelect(giveaway)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={giveaway.image}
                      alt={giveaway.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3">
                        <FiAward size={24} className="text-green-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{giveaway.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{giveaway.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-500 text-sm">
                        <FiAward className="mr-1" />
                        <span>Kazanan: {giveaway.winner}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 text-sm">
                        <FiUsers className="mr-1" />
                        <span>{giveaway.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 