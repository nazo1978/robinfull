using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;
using ShopApp.Domain.Enums;

namespace ShopApp.Application.Services.Discounts;

public class DiscountService : IDiscountService
{
    private readonly IDiscountRepository _discountRepository;
    private readonly IProductRepository _productRepository;

    public DiscountService(
        IDiscountRepository discountRepository,
        IProductRepository productRepository)
    {
        _discountRepository = discountRepository;
        _productRepository = productRepository;
    }

    public async Task<IEnumerable<Discount>> GetApplicableDiscountsAsync(Guid productId, int quantity, decimal price, CancellationToken cancellationToken = default)
    {
        var totalPrice = price * quantity;
        return await _discountRepository.GetApplicableDiscountsAsync(productId, quantity, totalPrice, cancellationToken);
    }

    public async Task<decimal> CalculateDiscountAsync(Guid productId, int quantity, decimal price, CancellationToken cancellationToken = default)
    {
        var (discountAmount, _, _) = await GetBestDiscountAsync(productId, quantity, price, cancellationToken);
        return discountAmount;
    }

    public async Task<(decimal DiscountAmount, decimal DiscountRate, Guid? DiscountId)> GetBestDiscountAsync(Guid productId, int quantity, decimal price, CancellationToken cancellationToken = default)
    {
        var totalPrice = price * quantity;
        var applicableDiscounts = await GetApplicableDiscountsAsync(productId, quantity, price, cancellationToken);

        if (!applicableDiscounts.Any())
            return (0, 0, null);

        decimal bestDiscountAmount = 0;
        decimal bestDiscountRate = 0;
        Guid? bestDiscountId = null;

        foreach (var discount in applicableDiscounts)
        {
            // Ürün miktarına uygun en yüksek indirim kuralını bul
            var applicableRules = discount.Rules
                .Where(r => r.MinimumQuantity <= quantity)
                .OrderByDescending(r => r.MinimumQuantity)
                .ToList();

            if (!applicableRules.Any())
                continue;

            var bestRule = applicableRules.First();
            decimal discountAmount = 0;

            if (discount.DiscountType == DiscountType.Percentage)
            {
                discountAmount = totalPrice * (bestRule.DiscountRate / 100);
            }
            else if (discount.DiscountType == DiscountType.FixedAmount && bestRule.DiscountAmount.HasValue)
            {
                discountAmount = bestRule.DiscountAmount.Value;
            }

            if (discountAmount > bestDiscountAmount)
            {
                bestDiscountAmount = discountAmount;
                bestDiscountRate = bestRule.DiscountRate;
                bestDiscountId = discount.Id;
            }
        }

        return (bestDiscountAmount, bestDiscountRate, bestDiscountId);
    }

    public async Task<bool> IsDiscountValidAsync(Guid discountId, CancellationToken cancellationToken = default)
    {
        var discount = await _discountRepository.GetByIdAsync(discountId, cancellationToken);

        if (discount == null)
            return false;

        return discount.IsActive && discount.StartDate <= DateTime.Now && discount.EndDate >= DateTime.Now;
    }
}
