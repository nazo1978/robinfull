using System;
using System.Collections.Generic;

namespace ShopApp.Application.Features.Auctions.Queries.GetAuctions;

public class GetAuctionsResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductDescription { get; set; }

    // Zaman bilgileri
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int CountdownDuration { get; set; }
    public int RemainingMinutes { get; set; } // Kalan süre (dakika)

    // Fiyat bilgileri
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MaxPrice { get; set; }

    // Ürün bilgileri
    public int ProductQuantity { get; set; }

    // Teklif bilgileri
    public int BidCount { get; set; }

    // Durum bilgileri
    public bool IsActive { get; set; }
}
