using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface IProductRepository : IAsyncRepository<Product>
{
    Task<Product> GetProductWithCategoryAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedList<Product>> GetProductsAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetProductsByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Product>> GetProductsWithCategoryAsync(CancellationToken cancellationToken = default);
}