/**
 * Order Service - Sipariş yönetimi için API servisi
 */

import apiService, { ApiResponse } from './ApiService';

// Order Types
export interface OrderItem {
  id?: string;
  productId: string;
  productName?: string;
  productDescription?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  discountAmount: number;
  originalTotalPrice?: number;
  totalPrice: number;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CreateOrderRequest {
  orderItems: OrderItem[];
  shipping: ShippingInfo;
  paymentMethod: PaymentMethod;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderItems: OrderItem[];
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  notes?: string;
  createdDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  paymentDate?: string;
}

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4
}

export enum PaymentMethod {
  CreditCard = 0,
  BankTransfer = 1,
  PayPal = 2,
  CashOnDelivery = 3
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3
}

export interface OrdersResponse {
  orders: Order[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

class OrderService {
  private readonly baseEndpoint = '/api/Orders';

  /**
   * Yeni sipariş oluştur
   */
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiService.post<Order>(this.baseEndpoint, orderData);
  }

  /**
   * Tüm siparişleri getir (Admin)
   */
  async getOrders(filters?: OrderFilters): Promise<ApiResponse<OrdersResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() 
      ? `${this.baseEndpoint}?${queryParams.toString()}`
      : this.baseEndpoint;

    return apiService.get<OrdersResponse>(endpoint);
  }

  /**
   * Kullanıcının siparişlerini getir
   */
  async getMyOrders(filters?: Omit<OrderFilters, 'searchTerm'>): Promise<ApiResponse<OrdersResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() 
      ? `${this.baseEndpoint}/my-orders?${queryParams.toString()}`
      : `${this.baseEndpoint}/my-orders`;

    return apiService.get<OrdersResponse>(endpoint);
  }

  /**
   * Belirli bir siparişi getir
   */
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return apiService.get<Order>(`${this.baseEndpoint}/${orderId}`);
  }

  /**
   * Sipariş durumunu güncelle (Admin)
   */
  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    paymentStatus?: PaymentStatus
  ): Promise<ApiResponse<void>> {
    const body = { status, paymentStatus };
    return apiService.put<void>(`${this.baseEndpoint}/${orderId}/status`, body);
  }

  /**
   * Siparişi iptal et
   */
  async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    return apiService.put<void>(`${this.baseEndpoint}/${orderId}/cancel`);
  }

  /**
   * Sipariş durumu enum'unu string'e çevir
   */
  static getOrderStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'Beklemede';
      case OrderStatus.Processing:
        return 'İşleniyor';
      case OrderStatus.Shipped:
        return 'Kargoya Verildi';
      case OrderStatus.Delivered:
        return 'Teslim Edildi';
      case OrderStatus.Cancelled:
        return 'İptal Edildi';
      default:
        return 'Bilinmeyen';
    }
  }

  /**
   * Ödeme durumu enum'unu string'e çevir
   */
  static getPaymentStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'Beklemede';
      case PaymentStatus.Paid:
        return 'Ödendi';
      case PaymentStatus.Failed:
        return 'Başarısız';
      case PaymentStatus.Refunded:
        return 'İade Edildi';
      default:
        return 'Bilinmeyen';
    }
  }

  /**
   * Ödeme yöntemi enum'unu string'e çevir
   */
  static getPaymentMethodText(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CreditCard:
        return 'Kredi Kartı';
      case PaymentMethod.BankTransfer:
        return 'Banka Havalesi';
      case PaymentMethod.PayPal:
        return 'PayPal';
      case PaymentMethod.CashOnDelivery:
        return 'Kapıda Ödeme';
      default:
        return 'Bilinmeyen';
    }
  }

  /**
   * Sipariş durumu rengini getir
   */
  static getOrderStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'text-yellow-600 bg-yellow-100';
      case OrderStatus.Processing:
        return 'text-blue-600 bg-blue-100';
      case OrderStatus.Shipped:
        return 'text-purple-600 bg-purple-100';
      case OrderStatus.Delivered:
        return 'text-green-600 bg-green-100';
      case OrderStatus.Cancelled:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Ödeme durumu rengini getir
   */
  static getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'text-yellow-600 bg-yellow-100';
      case PaymentStatus.Paid:
        return 'text-green-600 bg-green-100';
      case PaymentStatus.Failed:
        return 'text-red-600 bg-red-100';
      case PaymentStatus.Refunded:
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

// Singleton instance
const orderService = new OrderService();

export default orderService;
export { OrderService };
