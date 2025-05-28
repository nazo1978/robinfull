using MediatR;
using ShopApp.Core.Pagination;

namespace ShopApp.Application.Features.KurumsalMusteriler.Queries.GetListKurumsalMusteri;

public record GetListKurumsalMusteriQuery : IRequest<PaginatedResult<GetListKurumsalMusteriResponse>>
{
    public int PageSize { get; init; } = 10;
    public int PageIndex { get; init; } = 0;
    public string? SearchTerm { get; init; }
}
