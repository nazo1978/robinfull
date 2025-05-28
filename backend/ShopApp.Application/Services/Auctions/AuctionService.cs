using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Auctions;

public class AuctionService : IAuctionService
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IApplicationDbContext _dbContext;

    public AuctionService(
        IAuctionRepository auctionRepository,
        IApplicationDbContext dbContext)
    {
        _auctionRepository = auctionRepository;
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<Auction>> GetEndingSoonAuctionsAsync(int hours, int count, CancellationToken cancellationToken = default)
    {
        return await _auctionRepository.GetEndingSoonAuctionsAsync(hours, count, cancellationToken);
    }

    public async Task<bool> IsAuctionActiveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _auctionRepository.IsAuctionActiveAsync(id, cancellationToken);
    }

    public async Task<bool> CloseExpiredAuctionsAsync(CancellationToken cancellationToken = default)
    {
        // Find all active auctions that have ended
        var expiredAuctions = await _dbContext.Auctions
            .Where(a => a.IsActive && a.EndTime <= DateTime.Now)
            .ToListAsync(cancellationToken);

        if (!expiredAuctions.Any())
            return true;

        // Mark them as inactive
        foreach (var auction in expiredAuctions)
        {
            auction.IsActive = false;

            // Not: SignalR entegrasyonu WebApi katmanında yapılacak
            // Burada sadece veritabanı işlemleri gerçekleştiriliyor
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> NotifyWinnersAsync(CancellationToken cancellationToken = default)
    {
        // Find all inactive auctions with a winner that haven't been notified yet
        var auctionsToNotify = await _dbContext.Auctions
            .Include(a => a.Product)
            .Where(a => !a.IsActive && a.CurrentWinnerId != null)
            .ToListAsync(cancellationToken);

        if (!auctionsToNotify.Any())
            return true;

        foreach (var auction in auctionsToNotify)
        {
            // In a real implementation, you would send an email or notification to the winner
            // Not: SignalR entegrasyonu WebApi katmanında yapılacak
            // Burada sadece veritabanı işlemleri gerçekleştiriliyor

            // Kazanan kullanıcıya bildirim gönderme işlemi burada yapılacak
            // Örneğin: Email gönderme servisi kullanılabilir
        }

        return true;
    }
}
