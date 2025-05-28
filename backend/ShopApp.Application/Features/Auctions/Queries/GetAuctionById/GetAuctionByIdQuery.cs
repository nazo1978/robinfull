using System;
using MediatR;

namespace ShopApp.Application.Features.Auctions.Queries.GetAuctionById;

public class GetAuctionByIdQuery : IRequest<GetAuctionByIdResponse>
{
    public Guid Id { get; set; }
}
