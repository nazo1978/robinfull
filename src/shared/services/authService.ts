/**
 * Auth Service
 * Direct backend API calls for authentication
 */

const API_BASE_URL = 'http://localhost:5128/api';

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

interface LoginResponse {
  accessToken: {
    token: string;
    expiration: string;
  };
  username: string;
  email: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔐 AuthService.login START:', {
        email: credentials.email,
        url: `${API_BASE_URL}/auth/login`
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('📡 AuthService.login RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('📦 AuthService.login DATA:', data);

      if (!response.ok) {
        console.error('❌ AuthService.login FAILED:', {
          status: response.status,
          data: data
        });
        throw new Error(data.message || data.title || 'Login failed');
      }

      console.log('✅ AuthService.login SUCCESS:', {
        hasAccessToken: !!data.accessToken,
        username: data.username,
        email: data.email
      });

      return {
        success: true,
        data: data,
        message: 'Login successful',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ AuthService.login ERROR:', error);
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
