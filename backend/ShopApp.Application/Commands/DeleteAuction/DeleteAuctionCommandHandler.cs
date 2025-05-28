using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.DeleteAuction;

public class DeleteAuctionCommandHandler : IRequestHandler<DeleteAuctionCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteAuctionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteAuctionCommand request, CancellationToken cancellationToken)
    {
        // Açık artırmayı bul
        var auction = await _context.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (auction == null)
            throw new Exception("Açık artırma bulunamadı");

        // Aktif açık artırma ve teklif varsa silinemez
        if (auction.Status == AuctionStatus.Active && auction.Bids.Any())
        {
            throw new Exception("Teklif almış aktif açık artırmalar silinemez. Önce açık artırmayı iptal edin.");
        }

        // Önce teklifleri sil
        if (auction.Bids.Any())
        {
            _context.Bids.RemoveRange(auction.Bids);
        }

        // Sonra açık artırmayı sil
        _context.Auctions.Remove(auction);
        
        await _context.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
