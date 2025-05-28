// Açık artırma durum güncelleme scheduler'ı

let schedulerInterval: NodeJS.Timeout | null = null;

export function startAuctionScheduler() {
  // Eğer zaten çalışıyorsa durdur
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  // Her 1 dakikada bir durum güncelleme
  schedulerInterval = setInterval(async () => {
    try {
      const response = await fetch('/api/auctions/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Response işleme
    } catch (error) {
      // Scheduler hatası
    }
  }, 60000); // 60 saniye = 1 dakika

  return schedulerInterval;
}

export function stopAuctionScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

// Browser ortamında çalışıyorsa otomatik başlat
if (typeof window !== 'undefined') {
  // Sayfa yüklendiğinde başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAuctionScheduler);
  } else {
    startAuctionScheduler();
  }

  // Sayfa kapatılırken durdur
  window.addEventListener('beforeunload', stopAuctionScheduler);
}
