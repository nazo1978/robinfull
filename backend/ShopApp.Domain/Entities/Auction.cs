using System;
using System.Collections.Generic;
using ShopApp.Core.Common;
using ShopApp.Core.Identity;

namespace ShopApp.Domain.Entities
{
    public class Auction : BaseEntity
    {
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;

        // Zaman bilgileri
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // Fiyat bilgileri
        public decimal StartPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal MinIncrement { get; set; } = 1;

        // Durum bilgileri
        public AuctionStatus Status { get; set; } = AuctionStatus.Pending;
        public Guid? HighestBidderId { get; set; }
        public ApplicationUser? HighestBidder { get; set; }

        public string? Description { get; set; }

        // İlişkiler
        public ICollection<Bid> Bids { get; set; } = new List<Bid>();
    }

    public enum AuctionStatus
    {
        Pending = 0,    // Henüz başlamamış
        Active = 1,     // Aktif
        Ended = 2,      // Sona ermiş
        Cancelled = 3   // İptal edilmiş
    }
}