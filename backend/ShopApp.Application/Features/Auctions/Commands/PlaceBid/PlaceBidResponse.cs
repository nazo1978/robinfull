using System;

namespace ShopApp.Application.Features.Auctions.Commands.PlaceBid;

public class PlaceBidResponse
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public Guid BidderId { get; set; }
    public decimal BidAmount { get; set; }
    public DateTime BidTime { get; set; }
    public bool IsHighestBid { get; set; }
}
