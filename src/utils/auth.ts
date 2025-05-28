import { NextRequest } from 'next/server';
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

interface AuthResult {
  success: boolean;
  message?: string;
  user?: any;
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export async function isAdmin(req: NextRequest): Promise<AuthResult> {
  const authResult = await isAuthenticated(req);

  if (!authResult.success) {
    return authResult;
  }

  // Kullanıcı admin mi kontrol et
  if (authResult.user.role !== 'admin') {
    // Test ortamında her zaman admin yetkisi ver
    if (process.env.NODE_ENV === 'development') {
      console.log('Geliştirme ortamında admin yetkisi verildi');
      return authResult;
    }

    return {
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir'
    };
  }

  return authResult;
}

/**
 * Kullanıcının kimlik doğrulamasını yapar
 */
export async function isAuthenticated(req: NextRequest): Promise<AuthResult> {
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Test ortamında her zaman yetkilendir
      if (process.env.NODE_ENV === 'development') {
        console.log('Geliştirme ortamında otomatik yetkilendirme yapıldı');
        return {
          success: true,
          user: {
            _id: new ObjectId('65f1e5b3c52f6d8e9a7b4c2d'),
            name: 'Test Admin',
            email: 'admin@example.com',
            role: 'admin',
            token: 'test-token-123456'
          }
        };
      }

      return { success: false, message: 'Yetkilendirme başarısız: Token bulunamadı' };
    }

    const token = authHeader.substring(7);

    // Test ortamında basit bir token kontrolü
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        user: {
          _id: new ObjectId('65f1e5b3c52f6d8e9a7b4c2d'),
          name: 'Test Admin',
          email: 'admin@example.com',
          role: 'admin',
          token: token
        }
      };
    }

    // Gerçek token doğrulama
    const { db } = await connectToDatabase();

    // Token'a göre kullanıcıyı bul
    const session = await db.collection('sessions').findOne({ token });

    if (!session) {
      return { success: false, message: 'Geçersiz token' };
    }

    // Token süresi dolmuş mu kontrol et
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return { success: false, message: 'Token süresi dolmuş' };
    }

    // Kullanıcıyı getir
    const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });

    if (!user) {
      return { success: false, message: 'Kullanıcı bulunamadı' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    return { success: false, message: 'Yetkilendirme sırasında bir hata oluştu' };
  }
}
