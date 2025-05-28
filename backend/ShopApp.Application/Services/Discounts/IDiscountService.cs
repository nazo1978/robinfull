using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Discounts;

public interface IDiscountService
{
    Task<IEnumerable<Discount>> GetApplicableDiscountsAsync(Guid productId, int quantity, decimal price, CancellationToken cancellationToken = default);
    Task<decimal> CalculateDiscountAsync(Guid productId, int quantity, decimal price, CancellationToken cancellationToken = default);
    Task<(decimal DiscountAmount, decimal DiscountRate, Guid? DiscountId)> GetBestDiscountAsync(Guid productId, int quantity, decimal price, CancellationToken cancellationToken = default);
    Task<bool> IsDiscountValidAsync(Guid discountId, CancellationToken cancellationToken = default);
}
