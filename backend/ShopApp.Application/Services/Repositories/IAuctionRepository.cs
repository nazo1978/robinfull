using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface IAuctionRepository : IAsyncRepository<Auction>
{
    Task<Auction> GetAuctionWithBidsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Auction> GetAuctionWithProductAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Auction> GetAuctionWithBidsAndProductAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedList<Auction>> GetActiveAuctionsAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default);
    Task<PagedList<Auction>> GetAuctionsByProductIdAsync(Guid productId, int pageIndex, int pageSize, CancellationToken cancellationToken = default);
    Task<bool> IsAuctionActiveAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Auction>> GetEndingSoonAuctionsAsync(int hours, int count, CancellationToken cancellationToken = default);
}
