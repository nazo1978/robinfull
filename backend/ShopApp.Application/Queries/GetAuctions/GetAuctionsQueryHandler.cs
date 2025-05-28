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

namespace ShopApp.Application.Queries.GetAuctions;

public class GetAuctionsQueryHandler : IRequestHandler<GetAuctionsQuery, List<AuctionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAuctionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuctionDto>> Handle(GetAuctionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Auctions
            .Include(a => a.Product)
                .ThenInclude(p => p.Category)
            .Include(a => a.HighestBidder)
            .Include(a => a.Bids)
                .ThenInclude(b => b.User)
            .AsQueryable();

        // Status filtresi
        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<AuctionStatus>(request.Status, true, out var status))
            {
                query = query.Where(a => a.Status == status);
            }
            else if (request.Status.ToLower() == "active")
            {
                query = query.Where(a => a.Status == AuctionStatus.Active);
            }
        }

        // Kategori filtresi
        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(a => a.Product.Category.Name == request.Category);
        }

        // Sıralama
        query = request.SortBy?.ToLower() switch
        {
            "endingsoon" => query.OrderBy(a => a.EndTime),
            "highestbid" => query.OrderByDescending(a => a.CurrentPrice),
            "mostbids" => query.OrderByDescending(a => a.Bids.Count),
            "newest" => query.OrderByDescending(a => a.CreatedDate),
            _ => query.OrderBy(a => a.EndTime)
        };

        // Sayfalama
        var auctions = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return auctions.Select(a => new AuctionDto
        {
            Id = a.Id,
            ProductId = a.ProductId,
            Product = new ProductDto
            {
                Id = a.Product.Id,
                Name = a.Product.Name,
                Description = a.Product.Description,
                ImageUrl = a.Product.ImageUrl,
                CategoryName = a.Product.Category?.Name ?? "Belirtilmemiş"
            },
            StartPrice = a.StartPrice,
            CurrentPrice = a.CurrentPrice,
            MinIncrement = a.MinIncrement,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            Status = a.Status.ToString().ToLower(),
            HighestBidderId = a.HighestBidderId,
            HighestBidder = a.HighestBidder != null ? new UserDto
            {
                Id = a.HighestBidder.Id,
                Username = a.HighestBidder.Username,
                Email = a.HighestBidder.Email
            } : null,
            Description = a.Description,
            Bids = a.Bids.OrderByDescending(b => b.BidTime).Select(b => new BidDto
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
            CreatedDate = a.CreatedDate,
            ModifiedDate = a.ModifiedDate
        }).ToList();
    }
}
