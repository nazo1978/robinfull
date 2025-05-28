using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities
{
    public class AuctionBid : BaseEntity
    {
        public Guid AuctionId { get; set; }
        public Auction Auction { get; set; }
        public Guid BidderId { get; set; }
        public decimal BidAmount { get; set; }
        public DateTime BidTime { get; set; }
    }
}