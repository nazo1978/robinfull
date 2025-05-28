using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.CreateBid;

public class CreateBidCommandHandler : IRequestHandler<CreateBidCommand, BidDto>
{
    private readonly IApplicationDbContext _context;

    public CreateBidCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BidDto> Handle(CreateBidCommand request, CancellationToken cancellationToken)
    {
        // Açık artırmayı kontrol et
        var auction = await _context.Auctions
            .Include(a => a.Bids)
            .Include(a => a.HighestBidder)
            .FirstOrDefaultAsync(a => a.Id == request.AuctionId, cancellationToken);

        if (auction == null)
            throw new Exception("Açık artırma bulunamadı");

        if (auction.Status != AuctionStatus.Active)
            throw new Exception("Bu açık artırma aktif değil");

        if (auction.EndTime <= DateTime.UtcNow)
            throw new Exception("Bu açık artırma sona ermiş");

        // Minimum teklif kontrolü
        var minimumBid = auction.CurrentPrice + auction.MinIncrement;
        if (request.Amount < minimumBid)
            throw new Exception($"Teklif en az {minimumBid:C} olmalıdır");

        // Kullanıcının zaten en yüksek teklifi verip vermediğini kontrol et
        if (auction.HighestBidderId == request.UserId)
            throw new Exception("Zaten en yüksek teklifi siz verdiniz");

        // Kullanıcıyı kontrol et
        var user = await _context.ApplicationUsers.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("Kullanıcı bulunamadı");

        // Önceki tüm teklifleri kazanmayan olarak işaretle
        var previousBids = auction.Bids.Where(b => b.IsWinning);
        foreach (var prevBid in previousBids)
        {
            prevBid.IsWinning = false;
        }

        // Yeni teklif oluştur
        var bid = new Bid
        {
            Id = Guid.NewGuid(),
            AuctionId = request.AuctionId,
            UserId = request.UserId,
            Amount = request.Amount,
            BidTime = DateTime.UtcNow,
            IsWinning = true,
            Notes = request.Notes,
            CreatedDate = DateTime.UtcNow
        };

        _context.Bids.Add(bid);

        // Açık artırmayı güncelle
        auction.CurrentPrice = request.Amount;
        auction.HighestBidderId = request.UserId;
        auction.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new BidDto
        {
            Id = bid.Id,
            AuctionId = bid.AuctionId,
            UserId = bid.UserId,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email
            },
            Amount = bid.Amount,
            BidTime = bid.BidTime,
            IsWinning = bid.IsWinning,
            Notes = bid.Notes
        };
    }
}
