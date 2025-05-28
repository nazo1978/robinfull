using MediatR;
using ShopApp.Application.DTOs;
using System;

namespace ShopApp.Application.Commands.CreateAuction;

public class CreateAuctionCommand : IRequest<AuctionDto>
{
    public Guid ProductId { get; set; }
    public decimal StartPrice { get; set; }
    public decimal MinIncrement { get; set; } = 1;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Description { get; set; }
}
