using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class CartRepository : AsyncRepository<Cart>, ICartRepository
{
    public CartRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Cart> GetCartByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Carts
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    }

    public async Task<Cart> GetCartWithItemsAsync(Guid cartId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == cartId, cancellationToken);
    }

    public async Task<Cart> GetCartWithItemsAndProductsAsync(Guid cartId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.Id == cartId, cancellationToken);
    }
} 