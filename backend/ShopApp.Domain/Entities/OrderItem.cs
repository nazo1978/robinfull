using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
    
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    // Ürün bilgileri (sipariş anındaki bilgiler)
    public string ProductName { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public string? ProductImage { get; set; }
    
    // Miktar ve fiyat
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    
    // İndirim bilgileri
    public decimal DiscountRate { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal OriginalTotalPrice { get; set; }
    public decimal TotalPrice { get; set; }
    
    // İndirim referansı (opsiyonel)
    public Guid? AppliedDiscountId { get; set; }
    public Discount? AppliedDiscount { get; set; }
}
