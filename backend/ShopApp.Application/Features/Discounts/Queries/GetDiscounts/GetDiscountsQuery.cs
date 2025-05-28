using MediatR;
using ShopApp.Core.Pagination;

namespace ShopApp.Application.Features.Discounts.Queries.GetDiscounts;

public class GetDiscountsQuery : IRequest<PaginatedResult<GetDiscountsResponse>>
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
