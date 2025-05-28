using System;
using MediatR;

namespace ShopApp.Application.Features.Auctions.Commands.DeleteAuction;

public class DeleteAuctionCommand : IRequest<DeleteAuctionResponse>
{
    public Guid Id { get; set; }
}
