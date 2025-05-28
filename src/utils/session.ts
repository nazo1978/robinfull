import { cookies } from 'next/headers';

// Session bilgileri tipi
interface SessionData {
  token: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    username?: string;
    role: string;
  };
}

/**
 * Kullanıcı oturum bilgilerini almak için kullanılan fonksiyon
 * Hem client-side hem server-side ortamlarda çalışır
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    // Client-side (browser) mı kontrol et
    if (typeof window !== 'undefined') {
      // Önce admin oturumunu kontrol et
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          return {
            token: admin.token,
            user: {
              _id: admin._id || admin.id,
              name: admin.name,
              email: admin.email,
              username: admin.username,
              role: 'admin'
            }
          };
        } catch (e) {
          // Admin verisi ayrıştırılamadı
        }
      }

      // Admin yoksa normal kullanıcı oturumunu kontrol et
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return {
            token: user.token,
            user: {
              _id: user._id || user.id,
              name: user.name,
              email: user.email,
              username: user.username,
              role: user.role || 'user'
            }
          };
        } catch (e) {
          // Kullanıcı verisi ayrıştırılamadı
        }
      }

      return null;
    }
    // Server-side (API rotaları) için
    else {
      try {
        // Cookieler üzerinden token almayı dene
        const cookieStore = cookies();
        const adminTokenCookie = cookieStore.get('adminToken');
        const userTokenCookie = cookieStore.get('userToken');

        if (adminTokenCookie?.value) {
          return { token: adminTokenCookie.value, user: { _id: '', name: '', email: '', role: 'admin' } };
        }

        if (userTokenCookie?.value) {
          return { token: userTokenCookie.value, user: { _id: '', name: '', email: '', role: 'user' } };
        }

        return null;
      } catch (error) {
        return null;
      }
    }
  } catch (error) {
    return null;
  }
}
