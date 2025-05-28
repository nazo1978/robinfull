using System;
using System.Collections.Generic;

namespace ShopApp.Application.Features.Auctions.Queries.GetAuctionById;

public class GetAuctionByIdResponse
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

    // Durum bilgileri
    public Guid? CurrentWinnerId { get; set; }
    public string? CurrentWinnerName { get; set; }
    public bool IsActive { get; set; }

    // Teklifler
    public List<AuctionBidDto> Bids { get; set; } = new List<AuctionBidDto>();
}

public class AuctionBidDto
{
    public Guid Id { get; set; }
    public Guid BidderId { get; set; }
    public string? BidderName { get; set; }
    public decimal BidAmount { get; set; }
    public DateTime BidTime { get; set; }
}
