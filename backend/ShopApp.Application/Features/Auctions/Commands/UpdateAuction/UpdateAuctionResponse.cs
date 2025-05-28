using System;

namespace ShopApp.Application.Features.Auctions.Commands.UpdateAuction;

public class UpdateAuctionResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public Guid? CurrentWinnerId { get; set; }
    public bool IsActive { get; set; }
}
