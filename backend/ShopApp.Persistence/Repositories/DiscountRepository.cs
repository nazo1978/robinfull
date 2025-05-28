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

public class DiscountRepository : AsyncRepository<Discount>, IDiscountRepository
{
    public DiscountRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Discount> GetDiscountWithRulesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Discounts
            .Include(d => d.Rules)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Discount>> GetActiveDiscountsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Discounts
            .Include(d => d.Rules)
            .Where(d => d.IsActive && d.StartDate <= DateTime.Now && d.EndDate >= DateTime.Now)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Discount>> GetDiscountsByProductIdAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Discounts
            .Include(d => d.Rules)
            .Where(d => d.IsActive && d.StartDate <= DateTime.Now && d.EndDate >= DateTime.Now &&
                       (d.ProductId == productId || d.ProductId == null))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Discount>> GetDiscountsByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Discounts
            .Include(d => d.Rules)
            .Where(d => d.IsActive && d.StartDate <= DateTime.Now && d.EndDate >= DateTime.Now &&
                       (d.CategoryId == categoryId || d.CategoryId == null))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Discount>> GetApplicableDiscountsAsync(Guid productId, int quantity, decimal totalPrice, CancellationToken cancellationToken = default)
    {
        // Ürün bilgisini al
        var product = await _dbContext.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product == null)
            return new List<Discount>();

        // Aktif indirimleri getir
        var discounts = await _dbContext.Discounts
            .Include(d => d.Rules)
            .Where(d => d.IsActive && d.StartDate <= DateTime.Now && d.EndDate >= DateTime.Now &&
                       (d.ProductId == productId || d.CategoryId == product.CategoryId || (d.ProductId == null && d.CategoryId == null)) &&
                       d.MinimumPurchaseAmount <= totalPrice)
            .ToListAsync(cancellationToken);

        // Miktar bazlı kuralları filtrele
        return discounts.Where(d => d.Rules.Any(r => r.MinimumQuantity <= quantity));
    }

    public async Task<PagedList<Discount>> GetDiscountsAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Discounts
            .Include(d => d.Rules)
            .OrderByDescending(d => d.CreatedDate);

        return await PagedList<Discount>.CreateAsync(query, pageIndex, pageSize, cancellationToken);
    }
}
