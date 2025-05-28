using MediatR;
using System;

namespace ShopApp.Application.Commands.DeleteAuction;

public class DeleteAuctionCommand : IRequest<bool>
{
    public Guid Id { get; set; }

    public DeleteAuctionCommand(Guid id)
    {
        Id = id;
    }
}
