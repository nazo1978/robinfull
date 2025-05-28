using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; }

    public Guid ProductId { get; set; }
    public Product Product { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    // İndirim bilgileri
    public decimal DiscountRate { get; set; } // Yüzde olarak indirim oranı
    public decimal DiscountAmount { get; set; } // Toplam indirim tutarı
    public decimal OriginalTotalPrice { get; set; } // İndirimsiz toplam fiyat
    public decimal TotalPrice { get; set; } // İndirimli toplam fiyat

    // İndirim referansı (opsiyonel)
    public Guid? AppliedDiscountId { get; set; }
    public Discount AppliedDiscount { get; set; }
}