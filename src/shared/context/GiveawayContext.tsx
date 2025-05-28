'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Çekiliş veri tipi
export interface Giveaway {
  id: string;
  title: string;
  image: string;
  description: string;
  endDate: Date;
  participants: number;
  prize: string;
  status: 'active' | 'completed';
  rules: string;
  winner?: string;
}

// Çekiliş verileri API'den gelecek

// Context için tip tanımlamaları
interface GiveawayContextType {
  giveaways: Giveaway[];
  activeGiveaways: Giveaway[];
  completedGiveaways: Giveaway[];
  participations: string[]; // Kullanıcının katıldığı çekiliş ID'leri
  getGiveaway: (id: string) => Giveaway | undefined;
  participateInGiveaway: (id: string) => void;
  isParticipating: (id: string) => boolean;
  formatTimeRemaining: (endDate: Date) => string;
}

// Context oluşturma
const GiveawayContext = createContext<GiveawayContextType | undefined>(undefined);

// Provider bileşeni
export const GiveawayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [participations, setParticipations] = useState<string[]>([]);

  // Çekilişleri yükleme
  useEffect(() => {
    const fetchGiveaways = async () => {
      try {
        // API'den çekilişleri çek
        const response = await fetch('/api/giveaways');
        if (response.ok) {
          const data = await response.json();
          setGiveaways(data.giveaways || []);
        } else {
          // API yoksa boş array set et, hata loglamayı kaldır
          setGiveaways([]);
        }
      } catch (error) {
        // Hata loglamayı kaldır, sadece boş array set et
        setGiveaways([]);
      }
    };

    fetchGiveaways();

    // LocalStorage'dan kullanıcının katılım bilgilerini alma
    const savedParticipations = localStorage.getItem('giveawayParticipations');
    if (savedParticipations) {
      try {
        setParticipations(JSON.parse(savedParticipations));
      } catch {
        setParticipations([]);
      }
    }
  }, []);

  // Katılım bilgilerini LocalStorage'a kaydetme
  useEffect(() => {
    if (participations.length > 0) {
      localStorage.setItem('giveawayParticipations', JSON.stringify(participations));
    }
  }, [participations]);

  // Aktif çekilişleri filtreleme
  const activeGiveaways = giveaways.filter(giveaway => giveaway.status === 'active');

  // Tamamlanan çekilişleri filtreleme
  const completedGiveaways = giveaways.filter(giveaway => giveaway.status === 'completed');

  // ID'ye göre çekiliş bulma
  const getGiveaway = (id: string) => {
    return giveaways.find(giveaway => giveaway.id === id);
  };

  // Çekilişe katılma
  const participateInGiveaway = (id: string) => {
    if (!participations.includes(id)) {
      setParticipations([...participations, id]);

      // Gerçek uygulamada API çağrısı yapılacak
      // Burada katılımcı sayısını artırıyoruz (mock)
      setGiveaways(giveaways.map(giveaway =>
        giveaway.id === id
          ? { ...giveaway, participants: giveaway.participants + 1 }
          : giveaway
      ));
    }
  };

  // Kullanıcının çekilişe katılıp katılmadığını kontrol etme
  const isParticipating = (id: string) => {
    return participations.includes(id);
  };

  // Kalan süreyi formatlama
  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return 'Çekiliş sona erdi';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} gün ${hours} saat ${minutes} dakika`;
  };

  return (
    <GiveawayContext.Provider
      value={{
        giveaways,
        activeGiveaways,
        completedGiveaways,
        participations,
        getGiveaway,
        participateInGiveaway,
        isParticipating,
        formatTimeRemaining
      }}
    >
      {children}
    </GiveawayContext.Provider>
  );
};

// Context kullanımı için hook
export const useGiveaway = () => {
  const context = useContext(GiveawayContext);

  if (context === undefined) {
    throw new Error('useGiveaway must be used within a GiveawayProvider');
  }

  return context;
};