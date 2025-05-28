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

public class ProductRepository : AsyncRepository<Product>, IProductRepository
{
    public ProductRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<Product> GetProductWithCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<PagedList<Product>> GetProductsAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Products
            .Include(p => p.Category)
            .OrderBy(p => p.Name);

        return await PagedList<Product>.CreateAsync(query, pageIndex, pageSize, cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetProductsByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .Where(p => p.CategoryId == categoryId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Product>> GetProductsWithCategoryAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products
            .Include(p => p.Category)
            .ToListAsync(cancellationToken);
    }
}