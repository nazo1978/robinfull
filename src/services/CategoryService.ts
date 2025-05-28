/**
 * Category Service
 * API calls for category management
 */

import apiService from './ApiService';

export interface Category {
  id: string;
  name: string;
  description: string;
  products?: Product[];
  createdDate?: string;
  modifiedDate?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  category?: Category;
  createdDate?: string;
  modifiedDate?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  description: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

class CategoryService {
  private baseEndpoint = '/api/categories';

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiService.get<Category[]>(this.baseEndpoint);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiService.get<Category>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get categories with products
   */
  async getCategoriesWithProducts(): Promise<ApiResponse<Category[]>> {
    return apiService.get<Category[]>(`${this.baseEndpoint}?includeProducts=true`);
  }

  /**
   * Create new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiService.post<Category>(this.baseEndpoint, categoryData);
  }

  /**
   * Update category
   */
  async updateCategory(categoryData: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiService.put<Category>(`${this.baseEndpoint}/${categoryData.id}`, categoryData);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }
}

// Singleton instance
const categoryService = new CategoryService();

export default categoryService;
export { CategoryService };
