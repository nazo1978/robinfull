using MediatR;
using ShopApp.Application.DTOs;
using System;

namespace ShopApp.Application.Queries.GetAuctionById;

public class GetAuctionByIdQuery : IRequest<AuctionDto?>
{
    public Guid Id { get; set; }

    public GetAuctionByIdQuery(Guid id)
    {
        Id = id;
    }
}
