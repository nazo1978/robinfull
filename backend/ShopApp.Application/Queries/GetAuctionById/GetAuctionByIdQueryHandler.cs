using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Queries.GetAuctionById;

public class GetAuctionByIdQueryHandler : IRequestHandler<GetAuctionByIdQuery, AuctionDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAuctionByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AuctionDto?> Handle(GetAuctionByIdQuery request, CancellationToken cancellationToken)
    {
        var auction = await _context.Auctions
            .Include(a => a.Product)
                .ThenInclude(p => p.Category)
            .Include(a => a.HighestBidder)
            .Include(a => a.Bids)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (auction == null)
            return null;

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
