using System;
using MediatR;

namespace ShopApp.Application.Features.Auctions.Commands.CreateAuction
{
    public class CreateAuctionCommand : IRequest<CreateAuctionResponse>
    {
        public Guid ProductId { get; set; }

        // Zaman bilgileri
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int CountdownDuration { get; set; } = 0; // Geriye sayaç süresi (dakika)

        // Fiyat bilgileri
        public decimal StartingPrice { get; set; }
        public decimal MaxPrice { get; set; } = 0; // Maksimum fiyat limiti (0 = limit yok)

        // Ürün bilgileri
        public int ProductQuantity { get; set; } = 1; // Açık artırmadaki ürün adedi
    }
}