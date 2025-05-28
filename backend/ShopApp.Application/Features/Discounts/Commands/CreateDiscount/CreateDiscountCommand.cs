using System;
using System.Collections.Generic;
using MediatR;
using ShopApp.Domain.Enums;

namespace ShopApp.Application.Features.Discounts.Commands.CreateDiscount;

public class CreateDiscountCommand : IRequest<CreateDiscountResponse>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DiscountType DiscountType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal MinimumPurchaseAmount { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? CategoryId { get; set; }

    // İndirim kuralları
    public List<CreateDiscountRuleDto> Rules { get; set; } = new List<CreateDiscountRuleDto>();
}

public class CreateDiscountRuleDto
{
    public int MinimumQuantity { get; set; }
    public decimal DiscountRate { get; set; }
    public decimal? DiscountAmount { get; set; }
}
