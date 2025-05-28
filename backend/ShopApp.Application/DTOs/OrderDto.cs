using System;
using System.Collections.Generic;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    
    // Sipariş durumu
    public OrderStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    
    // Fiyat bilgileri
    public decimal ItemsPrice { get; set; }
    public decimal TaxPrice { get; set; }
    public decimal ShippingPrice { get; set; }
    public decimal TotalPrice { get; set; }
    
    // Teslimat bilgileri
    public ShippingInfoDto Shipping { get; set; } = new();
    
    // Ödeme bilgileri
    public PaymentInfoDto Payment { get; set; } = new();
    
    // Sipariş tarihleri
    public DateTime CreatedAt { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    
    // Notlar
    public string? Notes { get; set; }
    
    // Sipariş öğeleri
    public List<OrderItemDto> OrderItems { get; set; } = new();
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountRate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal OriginalTotalPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class ShippingInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class PaymentInfoDto
{
    public PaymentMethod Method { get; set; }
    public string MethodText { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public DateTime? PaymentDate { get; set; }
}
