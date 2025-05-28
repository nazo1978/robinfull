using System;
using System.Collections.Generic;
using ShopApp.Domain.Enums;

namespace ShopApp.Application.Features.Discounts.Commands.CreateDiscount;

public class CreateDiscountResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MinimumPurchaseAmount { get; set; }
    public Guid? ProductId { get; set; }
    public string? ProductName { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public bool IsActive { get; set; }

    // İndirim kuralları
    public List<DiscountRuleResponse> Rules { get; set; } = new List<DiscountRuleResponse>();
}

public class DiscountRuleResponse
{
    public Guid Id { get; set; }
    public int MinimumQuantity { get; set; }
    public decimal DiscountRate { get; set; }
    public decimal? DiscountAmount { get; set; }
}
