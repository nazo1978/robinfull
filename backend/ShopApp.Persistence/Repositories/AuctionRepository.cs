using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Services.Repositories;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class AuctionRepository : AsyncRepository<Auction>, IAuctionRepository
{
    public AuctionRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Auction> GetAuctionWithBidsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Auctions
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Auction> GetAuctionWithProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Auctions
            .Include(a => a.Product)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<Auction> GetAuctionWithBidsAndProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Auctions
            .Include(a => a.Product)
            .Include(a => a.Bids)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<PagedList<Auction>> GetActiveAuctionsAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Auctions
            .Include(a => a.Product)
            .Where(a => a.IsActive && a.EndTime > DateTime.Now)
            .OrderBy(a => a.EndTime);

        return await PagedList<Auction>.CreateAsync(query, pageIndex, pageSize, cancellationToken);
    }

    public async Task<PagedList<Auction>> GetAuctionsByProductIdAsync(Guid productId, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Auctions
            .Include(a => a.Product)
            .Where(a => a.ProductId == productId)
            .OrderByDescending(a => a.StartTime);

        return await PagedList<Auction>.CreateAsync(query, pageIndex, pageSize, cancellationToken);
    }

    public async Task<bool> IsAuctionActiveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var auction = await _dbContext.Auctions
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
            
        return auction != null && auction.IsActive && auction.EndTime > DateTime.Now;
    }

    public async Task<IEnumerable<Auction>> GetEndingSoonAuctionsAsync(int hours, int count, CancellationToken cancellationToken = default)
    {
        var endTime = DateTime.Now.AddHours(hours);
        
        return await _dbContext.Auctions
            .Include(a => a.Product)
            .Where(a => a.IsActive && a.EndTime <= endTime && a.EndTime > DateTime.Now)
            .OrderBy(a => a.EndTime)
            .Take(count)
            .ToListAsync(cancellationToken);
    }
}
