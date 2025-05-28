import { Redis } from '@upstash/redis';

// Upstash Redis bağlantısı
const redis = new Redis({
  url: process.env.REDIS_URL || 'https://example.upstash.io',
  token: process.env.REDIS_TOKEN || 'your-redis-token',
});

// Önbelleğe alma yardımcı fonksiyonu
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cachedData = await redis.get(key);
    return cachedData as T;
  } catch (error) {
    console.error('Redis cache error:', error);
    return null;
  }
}

// Önbelleğe veri kaydetme
export async function setCache<T>(
  key: string, 
  data: T, 
  expirationInSeconds: number = 3600
): Promise<void> {
  try {
    await redis.set(key, data, { ex: expirationInSeconds });
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
}

// Önbellekten veri silme
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
}

// Belirli bir önek ile başlayan tüm anahtarları silme
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis pattern invalidation error:', error);
  }
}

export default redis; 