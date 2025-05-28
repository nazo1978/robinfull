using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.CreateAuction;

public class CreateAuctionCommandHandler : IRequestHandler<CreateAuctionCommand, AuctionDto>
{
    private readonly IApplicationDbContext _context;

    public CreateAuctionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuctionDto> Handle(CreateAuctionCommand request, CancellationToken cancellationToken)
    {
        // Ürünü kontrol et
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
            throw new Exception("Ürün bulunamadı");

        // Validasyonlar
        if (request.StartPrice <= 0)
            throw new Exception("Başlangıç fiyatı 0'dan büyük olmalıdır");

        if (request.MinIncrement <= 0)
            throw new Exception("Minimum artış miktarı 0'dan büyük olmalıdır");

        if (request.EndTime <= request.StartTime)
            throw new Exception("Bitiş zamanı başlangıç zamanından sonra olmalıdır");

        if (request.StartTime <= DateTime.UtcNow)
            throw new Exception("Başlangıç zamanı gelecekte olmalıdır");

        // Aynı ürün için aktif açık artırma var mı kontrol et
        var existingAuction = await _context.Auctions
            .FirstOrDefaultAsync(a => a.ProductId == request.ProductId &&
                                    a.Status == AuctionStatus.Active, cancellationToken);

        if (existingAuction != null)
            throw new Exception("Bu ürün için zaten aktif bir açık artırma bulunmaktadır");

        // Yeni açık artırma oluştur
        var auction = new Auction
        {
            Id = Guid.NewGuid(),
            ProductId = request.ProductId,
            StartPrice = request.StartPrice,
            CurrentPrice = request.StartPrice,
            MinIncrement = request.MinIncrement,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = request.StartTime <= DateTime.UtcNow ? AuctionStatus.Active : AuctionStatus.Pending,
            Description = request.Description,
            CreatedDate = DateTime.UtcNow
        };

        _context.Auctions.Add(auction);
        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya çevir
        return new AuctionDto
        {
            Id = auction.Id,
            ProductId = auction.ProductId,
            Product = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                CategoryName = product.Category?.Name ?? "Belirtilmemiş"
            },
            StartPrice = auction.StartPrice,
            CurrentPrice = auction.CurrentPrice,
            MinIncrement = auction.MinIncrement,
            StartTime = auction.StartTime,
            EndTime = auction.EndTime,
            Status = auction.Status.ToString().ToLower(),
            Description = auction.Description,
            Bids = new List<BidDto>(), // Yeni açık artırmada henüz teklif yok
            CreatedDate = auction.CreatedDate,
            ModifiedDate = auction.ModifiedDate
        };
    }
}
