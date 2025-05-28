/**
 * Auth Service - Kimlik doğrulama için API servisi
 */

import apiService, { ApiResponse } from './ApiService';

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: {
    token: string;
    expiration: string;
  };
  username: string;
  email: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles: string[];
  role: 'user' | 'admin' | 'seller';
  isActive: boolean;
  createdDate: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

class AuthService {
  private readonly baseEndpoint = '/api/Auth';

  /**
   * Kullanıcı girişi
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.baseEndpoint}/login`, credentials);

    if (response.success && response.data) {
      this.setAuthToken(response.data.accessToken.token);

      // JWT token'ı decode et
      const tokenPayload = this.decodeJwtToken(response.data.accessToken.token);

      console.log('🔐 STEP 4 - JWT token decoded:', tokenPayload);
      console.log('🔐 STEP 4.1 - JWT token RAW:', response.data.accessToken.token);

      // Tüm claim'leri listele
      if (tokenPayload) {
        console.log('🔐 STEP 4.2 - All claims in token:');
        Object.keys(tokenPayload).forEach(key => {
          console.log(`  ${key}: ${tokenPayload[key]}`);
        });
      }

      // JWT claim'lerini doğru şekilde oku
      const nameId = tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const userType = tokenPayload?.UserType;
      const roleClaim = tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const firstName = tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
      const lastName = tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];

      const roles = Array.isArray(roleClaim) ? roleClaim : (roleClaim ? [roleClaim] : []);

      console.log('🔐 STEP 5 - UserType from token:', userType);
      console.log('🔐 STEP 6 - Roles from token:', roles);
      console.log('🔐 STEP 6.5 - NameId from token:', nameId);
      console.log('🔐 STEP 6.6 - FirstName from token:', firstName);
      console.log('🔐 STEP 6.7 - LastName from token:', lastName);

      // UserType'a göre role belirleme
      let userRole: 'user' | 'admin' | 'seller' = 'user'; // default
      if (userType === 'Admin' || roles.includes('Admin')) {
        userRole = 'admin';
      } else if (roles.includes('Seller')) {
        userRole = 'seller';
      }

      console.log('🔐 STEP 7 - Final role assigned:', userRole);

      // User object'ini oluştur
      const user: User = {
        id: nameId || '',
        username: response.data.username,
        email: response.data.email,
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNumber: '',
        roles: roles,
        role: userRole,
        isActive: true,
        createdDate: new Date().toISOString()
      };

      this.setCurrentUser(user);
    }

    return response;
  }

  /**
   * Kullanıcı kaydı
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiService.post<AuthResponse>(`${this.baseEndpoint}/register`, userData);

    if (response.success && response.data) {
      this.setAuthToken(response.data.token);
      this.setCurrentUser(response.data.user);
    }

    return response;
  }

  /**
   * Çıkış yap
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(`${this.baseEndpoint}/logout`);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Mevcut kullanıcı bilgilerini getir
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<User>(`${this.baseEndpoint}/me`);
  }

  /**
   * Profil güncelle
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<User>> {
    const response = await apiService.put<User>(`${this.baseEndpoint}/profile`, profileData);

    if (response.success && response.data) {
      this.setCurrentUser(response.data);
    }

    return response;
  }

  /**
   * Şifre değiştir
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiService.put<void>(`${this.baseEndpoint}/change-password`, passwordData);
  }

  /**
   * Token'ı kaydet
   */
  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;

    // Cookie'ye kaydet (7 gün)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;

    // localStorage'a da kaydet (fallback)
    localStorage.setItem('authToken', token);
  }

  /**
   * Kullanıcı bilgilerini kaydet
   */
  private setCurrentUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Auth verilerini temizle
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') return;

    // Cookie'yi temizle
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // localStorage'ı temizle
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  /**
   * Kullanıcının giriş yapıp yapmadığını kontrol et
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = this.getAuthToken();
    return !!token;
  }

  /**
   * Auth token'ı al
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Cookie'den token almayı dene
    const cookieMatch = document.cookie.match(/authToken=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }

    // localStorage'dan token almayı dene
    return localStorage.getItem('authToken');
  }

  /**
   * Mevcut kullanıcı bilgilerini al
   */
  getCurrentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Kullanıcının admin olup olmadığını kontrol et
   */
  isAdmin(): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.roles?.includes('Admin') || false;
  }

  /**
   * Kullanıcının seller olup olmadığını kontrol et
   */
  isSeller(): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.roles?.includes('Seller') || false;
  }

  /**
   * Kullanıcının belirli bir role sahip olup olmadığını kontrol et
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Token'ın geçerli olup olmadığını kontrol et
   */
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;

    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch {
      this.clearAuthData();
      return false;
    }
  }

  /**
   * JWT token'ı decode et
   */
  private decodeJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode error:', error);
      return null;
    }
  }
}

// Singleton instance
const authService = new AuthService();

export default authService;
export { AuthService };
