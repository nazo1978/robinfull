/**
 * API Service Class - OOP standardına uygun API yönetimi
 * Tüm API istekleri için merkezi servis sınıfı
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiService {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Auth token'ı header'lara ekle
   */
  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { ...this.defaultHeaders, 'Authorization': `Bearer ${token}` } : this.defaultHeaders;
  }

  /**
   * Auth token'ı al (cookie veya localStorage'dan)
   */
  private getAuthToken(): string | null {
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
   * HTTP isteği gönder
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout
    } = config;

    const url = this.baseUrl + endpoint;
    const requestHeaders = { ...this.getAuthHeaders(), ...headers };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          data: errorData
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: data.message
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'İstek zaman aşımına uğradı'
        };
      }

      return {
        success: false,
        error: error.message || 'Bilinmeyen bir hata oluştu'
      };
    }
  }

  /**
   * GET isteği
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST isteği
   */
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT isteği
   */
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE isteği
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Base URL'i güncelle
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Default timeout'u güncelle
   */
  setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Default header'ları güncelle
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Singleton instance
const apiService = new ApiService(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5128'
);

export default apiService;
export { ApiService };
export type { ApiResponse, RequestConfig };
