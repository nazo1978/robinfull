using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface IDiscountRepository : IAsyncRepository<Discount>
{
    Task<Discount> GetDiscountWithRulesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Discount>> GetActiveDiscountsAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<Discount>> GetDiscountsByProductIdAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Discount>> GetDiscountsByCategoryIdAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Discount>> GetApplicableDiscountsAsync(Guid productId, int quantity, decimal totalPrice, CancellationToken cancellationToken = default);
    Task<PagedList<Discount>> GetDiscountsAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default);
}
