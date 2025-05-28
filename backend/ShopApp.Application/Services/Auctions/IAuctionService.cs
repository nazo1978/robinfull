using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Auctions;

public interface IAuctionService
{
    Task<IEnumerable<Auction>> GetEndingSoonAuctionsAsync(int hours, int count, CancellationToken cancellationToken = default);
    Task<bool> IsAuctionActiveAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> CloseExpiredAuctionsAsync(CancellationToken cancellationToken = default);
    Task<bool> NotifyWinnersAsync(CancellationToken cancellationToken = default);
}
