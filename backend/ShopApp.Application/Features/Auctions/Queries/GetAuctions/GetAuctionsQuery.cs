using MediatR;
using ShopApp.Core.Pagination;

namespace ShopApp.Application.Features.Auctions.Queries.GetAuctions;

public class GetAuctionsQuery : IRequest<PaginatedResult<GetAuctionsResponse>>
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public bool OnlyActive { get; set; } = true;
}
