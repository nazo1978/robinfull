using AutoMapper;
using ShopApp.Application.Features.Discounts.Commands.CreateDiscount;
using ShopApp.Application.Features.Discounts.Queries.GetDiscounts;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Discounts.Profiles;

public class DiscountMappingProfiles : Profile
{
    public DiscountMappingProfiles()
    {
        // Discount mappings
        CreateMap<Discount, CreateDiscountResponse>();
        CreateMap<Discount, GetDiscountsResponse>();

        // DiscountRule mappings
        CreateMap<DiscountRule, DiscountRuleResponse>();
        CreateMap<DiscountRule, GetDiscountRuleDto>();
        CreateMap<DiscountRule, CreateDiscountRuleDto>();
    }
}
