/**
 * Auth Service
 * Direct backend API calls for authentication
 */

const API_BASE_URL = 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      console.log('🔐 AuthService.login:', { email: credentials.email });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ AuthService.login success:', { userId: data.data?.user?.id });
      return data;
    } catch (error) {
      console.error('❌ AuthService.login error:', error);
      throw error;
    }
  }

  /**
   * Register user
   */
  async register(userData: RegisterData): Promise<ApiResponse> {
    try {
      console.log('📝 AuthService.register:', { email: userData.email });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('✅ AuthService.register success');
      return data;
    } catch (error) {
      console.error('❌ AuthService.register error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<ApiResponse> {
    try {
      console.log('🚪 AuthService.logout');

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }

      console.log('✅ AuthService.logout success');
      return data;
    } catch (error) {
      console.error('❌ AuthService.logout error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(token: string): Promise<ApiResponse> {
    try {
      console.log('👤 AuthService.getProfile');

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile');
      }

      console.log('✅ AuthService.getProfile success');
      return data;
    } catch (error) {
      console.error('❌ AuthService.getProfile error:', error);
      throw error;
    }
  }

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<ApiResponse> {
    try {
      console.log('🔍 AuthService.verifyToken');

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token verification failed');
      }

      console.log('✅ AuthService.verifyToken success');
      return data;
    } catch (error) {
      console.error('❌ AuthService.verifyToken error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(token: string, oldPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      console.log('🔑 AuthService.changePassword');

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      console.log('✅ AuthService.changePassword success');
      return data;
    } catch (error) {
      console.error('❌ AuthService.changePassword error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
