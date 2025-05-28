using System;
using System.Collections.Generic;

namespace ShopApp.Application.DTOs;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // Fiyat bilgileri
    public decimal OriginalTotalPrice { get; set; } // İndirimsiz toplam fiyat
    public decimal TotalDiscountAmount { get; set; } // Toplam indirim tutarı
    public decimal TotalPrice { get; set; } // İndirimli toplam fiyat

    public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
}