using System;

namespace ShopApp.Application.Features.Auctions.Commands.CreateAuction;

public class CreateAuctionResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; }

    // Zaman bilgileri
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int CountdownDuration { get; set; }

    // Fiyat bilgileri
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MaxPrice { get; set; }

    // Ürün bilgileri
    public int ProductQuantity { get; set; }

    // Durum bilgileri
    public bool IsActive { get; set; }
}
