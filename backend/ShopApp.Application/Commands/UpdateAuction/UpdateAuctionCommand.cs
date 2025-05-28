using MediatR;
using ShopApp.Application.DTOs;
using System;

namespace ShopApp.Application.Commands.UpdateAuction;

public class UpdateAuctionCommand : IRequest<AuctionDto>
{
    public Guid Id { get; set; }
    public decimal StartPrice { get; set; }
    public decimal MinIncrement { get; set; } = 1;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Description { get; set; }
}
