using System;
using MediatR;

namespace ShopApp.Application.Features.Auctions.Commands.PlaceBid
{
    public class PlaceBidCommand : IRequest<PlaceBidResponse>
    {
        public Guid AuctionId { get; set; }
        public Guid BidderId { get; set; }
        public decimal BidAmount { get; set; }
    }
}