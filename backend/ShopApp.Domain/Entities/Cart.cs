using System;
using System.Collections.Generic;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid UserId { get; set; }

    // Fiyat bilgileri
    public decimal OriginalTotalPrice { get; set; } // İndirimsiz toplam fiyat
    public decimal TotalDiscountAmount { get; set; } // Toplam indirim tutarı
    public decimal TotalPrice { get; set; } // İndirimli toplam fiyat

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}