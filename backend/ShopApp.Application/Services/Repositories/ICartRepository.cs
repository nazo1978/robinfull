using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface ICartRepository : IAsyncRepository<Cart>
{
    Task<Cart> GetCartByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Cart> GetCartWithItemsAsync(Guid cartId, CancellationToken cancellationToken = default);
    Task<Cart> GetCartWithItemsAndProductsAsync(Guid cartId, CancellationToken cancellationToken = default);
} 