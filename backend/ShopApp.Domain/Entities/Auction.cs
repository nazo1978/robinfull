using System;
using System.Collections.Generic;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities
{
    public class Auction : BaseEntity
    {
        public Guid ProductId { get; set; }
        public Product Product { get; set; }

        // Zaman bilgileri
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int CountdownDuration { get; set; } // Geriye sayaç süresi (dakika)

        // Fiyat bilgileri
        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public decimal MaxPrice { get; set; } // Maksimum fiyat limiti

        // Ürün bilgileri
        public int ProductQuantity { get; set; } // Açık artırmadaki ürün adedi

        // Durum bilgileri
        public Guid? CurrentWinnerId { get; set; }
        public bool IsActive { get; set; }

        // İlişkiler
        public ICollection<AuctionBid> Bids { get; set; } = new List<AuctionBid>();
    }
}