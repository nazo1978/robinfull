using System;
using MediatR;

namespace ShopApp.Application.Features.Auctions.Commands.UpdateAuction;

public class UpdateAuctionCommand : IRequest<UpdateAuctionResponse>
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal StartingPrice { get; set; }
    public bool IsActive { get; set; }
}
