using MediatR;
using ShopApp.Application.DTOs;
using System;

namespace ShopApp.Application.Commands.CreateBid;

public class CreateBidCommand : IRequest<BidDto>
{
    public Guid AuctionId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}
