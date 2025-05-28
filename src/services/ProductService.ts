/**
 * Product Service Class - OOP standardına uygun ürün yönetimi
 * Tüm ürün işlemleri için merkezi servis sınıfı
 */

import apiService, { ApiResponse } from './ApiService';
import { Product } from '@/shared/types';

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

interface ProductListResponse {
  products: Product[];
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
}

interface ProductCreateData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  stock: number;
  images: Array<{ url: string; alt: string }>;
  featured?: boolean;
  isActive?: boolean;
}

class ProductService {
  private readonly endpoint = '/api/products';

  /**
   * Tüm ürünleri getir (alias for getAllProducts)
   */
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<ProductListResponse>> {
    return this.getAllProducts(filters);
  }

  /**
   * Tüm ürünleri getir
   */
  async getAllProducts(filters: ProductFilters = {}): Promise<ApiResponse<ProductListResponse>> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

      return await apiService.get<ProductListResponse>(endpoint);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ürünler getirilemedi'
      };
    }
  }

  /**
   * Tek ürün getir
   */
  async getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Geçersiz ürün ID\'si'
        };
      }

      return await apiService.get<{ product: Product }>(`${this.endpoint}/${id}`);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ürün getirilemedi'
      };
    }
  }

  /**
   * Öne çıkan ürünleri getir
   */
  async getFeaturedProducts(limit: number = 8): Promise<ApiResponse<ProductListResponse>> {
    return this.getAllProducts({ featured: true, limit });
  }

  /**
   * Kategoriye göre ürünleri getir
   */
  async getProductsByCategory(category: string, filters: Omit<ProductFilters, 'category'> = {}): Promise<ApiResponse<ProductListResponse>> {
    return this.getAllProducts({ ...filters, category });
  }

  /**
   * Ürün ara
   */
  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ApiResponse<ProductListResponse>> {
    if (!query || query.trim() === '') {
      return {
        success: false,
        error: 'Arama sorgusu boş olamaz'
      };
    }

    return this.getAllProducts({ ...filters, search: query.trim() });
  }

  /**
   * Yeni ürün oluştur (Admin/Seller)
   */
  async createProduct(productData: ProductCreateData): Promise<ApiResponse<{ product: Product }>> {
    try {
      const validationError = this.validateProductData(productData);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      return await apiService.post<{ product: Product }>(this.endpoint, productData);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ürün oluşturulamadı'
      };
    }
  }

  /**
   * Ürün güncelle (Admin/Seller)
   */
  async updateProduct(id: string, productData: Partial<ProductCreateData>): Promise<ApiResponse<{ product: Product }>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Geçersiz ürün ID\'si'
        };
      }

      return await apiService.put<{ product: Product }>(`${this.endpoint}/${id}`, productData);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ürün güncellenemedi'
      };
    }
  }

  /**
   * Ürün sil (Admin/Seller)
   */
  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!id || id.trim() === '') {
        return {
          success: false,
          error: 'Geçersiz ürün ID\'si'
        };
      }

      return await apiService.delete<{ message: string }>(`${this.endpoint}/${id}`);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ürün silinemedi'
      };
    }
  }

  /**
   * Ürün verilerini doğrula
   */
  private validateProductData(data: ProductCreateData): string | null {
    if (!data.name || data.name.trim() === '') {
      return 'Ürün adı gereklidir';
    }

    if (!data.description || data.description.trim() === '') {
      return 'Ürün açıklaması gereklidir';
    }

    if (!data.price || data.price <= 0) {
      return 'Geçerli bir fiyat giriniz';
    }

    if (!data.category || data.category.trim() === '') {
      return 'Kategori seçimi gereklidir';
    }

    if (!data.stock || data.stock < 0) {
      return 'Geçerli bir stok miktarı giriniz';
    }

    if (!data.images || data.images.length === 0) {
      return 'En az bir ürün resmi gereklidir';
    }

    return null;
  }

  /**
   * Fiyat formatla
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * İndirim yüzdesini hesapla
   */
  static calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= 0 || currentPrice <= 0 || currentPrice >= originalPrice) {
      return 0;
    }
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
}

// Singleton instance
const productService = new ProductService();

export default productService;
export { ProductService };
export type { ProductFilters, ProductListResponse, ProductCreateData };
