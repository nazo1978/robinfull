using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.UpdateAuction;

public class UpdateAuctionCommandHandler : IRequestHandler<UpdateAuctionCommand, AuctionDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateAuctionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuctionDto> Handle(UpdateAuctionCommand request, CancellationToken cancellationToken)
    {
        // Açık artırmayı bul
        var auction = await _context.Auctions
            .Include(a => a.Product)
                .ThenInclude(p => p.Category)
            .Include(a => a.HighestBidder)
            .Include(a => a.Bids)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (auction == null)
            throw new Exception("Açık artırma bulunamadı");

        // Aktif açık artırmalarda bazı alanlar değiştirilemez
        if (auction.Status == AuctionStatus.Active && auction.Bids.Any())
        {
            throw new Exception("Teklif almış aktif açık artırmalarda fiyat bilgileri değiştirilemez");
        }

        // Validasyonlar
        if (request.StartPrice <= 0)
            throw new Exception("Başlangıç fiyatı 0'dan büyük olmalıdır");

        if (request.MinIncrement <= 0)
            throw new Exception("Minimum artış miktarı 0'dan büyük olmalıdır");

        if (request.EndTime <= request.StartTime)
            throw new Exception("Bitiş zamanı başlangıç zamanından sonra olmalıdır");

        // Güncelleme
        auction.StartPrice = request.StartPrice;
        auction.MinIncrement = request.MinIncrement;
        auction.StartTime = request.StartTime;
        auction.EndTime = request.EndTime;
        auction.Description = request.Description;
        auction.ModifiedDate = DateTime.UtcNow;

        // Eğer henüz teklif yoksa current price'ı da güncelle
        if (!auction.Bids.Any())
        {
            auction.CurrentPrice = request.StartPrice;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya çevir
        return new AuctionDto
        {
            Id = auction.Id,
            ProductId = auction.ProductId,
            Product = new ProductDto
            {
                Id = auction.Product.Id,
                Name = auction.Product.Name,
                Description = auction.Product.Description,
                ImageUrl = auction.Product.ImageUrl,
                CategoryName = auction.Product.Category?.Name ?? "Belirtilmemiş"
            },
            StartPrice = auction.StartPrice,
            CurrentPrice = auction.CurrentPrice,
            MinIncrement = auction.MinIncrement,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status.ToString().ToLower(),
            HighestBidderId = auction.HighestBidderId,
            HighestBidder = auction.HighestBidder != null ? new UserDto
            {
                Id = auction.HighestBidder.Id,
                Username = auction.HighestBidder.Username,
                Email = auction.HighestBidder.Email
            } : null,
            Description = auction.Description,
            Bids = auction.Bids.OrderByDescending(b => b.BidTime).Select(b => new BidDto
            {
                Id = b.Id,
                AuctionId = b.AuctionId,
                UserId = b.UserId,
                User = new UserDto
                {
                    Id = b.User.Id,
                    Username = b.User.Username,
                    Email = b.User.Email
                },
                Amount = b.Amount,
                BidTime = b.BidTime,
                IsWinning = b.IsWinning,
                Notes = b.Notes
            }).ToList(),
            CreatedDate = auction.CreatedDate,
            ModifiedDate = auction.ModifiedDate
        };
    }
}
