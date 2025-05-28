using System;
using System.Collections.Generic;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    
    // Sipariş durumu
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    
    // Fiyat bilgileri
    public decimal ItemsPrice { get; set; }
    public decimal TaxPrice { get; set; }
    public decimal ShippingPrice { get; set; }
    public decimal TotalPrice { get; set; }
    
    // Teslimat bilgileri
    public string ShippingName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    
    // Ödeme bilgileri
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CreditCard;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public DateTime? PaymentDate { get; set; }
    
    // Sipariş tarihleri
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    
    // Notlar
    public string? Notes { get; set; }
    
    // Navigation properties
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public enum OrderStatus
{
    Pending = 0,        // Beklemede
    Processing = 1,     // İşleniyor
    Shipped = 2,        // Kargoya Verildi
    Delivered = 3,      // Teslim Edildi
    Cancelled = 4       // İptal Edildi
}

public enum PaymentMethod
{
    CreditCard = 0,     // Kredi Kartı
    DebitCard = 1,      // Banka Kartı
    BankTransfer = 2,   // Havale/EFT
    Cash = 3            // Nakit
}

public enum PaymentStatus
{
    Pending = 0,        // Beklemede
    Paid = 1,           // Ödendi
    Failed = 2,         // Başarısız
    Refunded = 3        // İade Edildi
}
