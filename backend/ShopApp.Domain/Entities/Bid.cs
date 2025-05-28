using System;
using ShopApp.Core.Common;
using ShopApp.Core.Identity;

namespace ShopApp.Domain.Entities
{
    public class Bid : BaseEntity
    {
        public Guid AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;

        public Guid UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public decimal Amount { get; set; }
        public DateTime BidTime { get; set; } = DateTime.UtcNow;

        public bool IsWinning { get; set; } = false;
        public string? Notes { get; set; }
    }
}
