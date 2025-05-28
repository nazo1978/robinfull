using MediatR;
using ShopApp.Core.Pagination;

namespace ShopApp.Application.Features.BireyselMusteriler.Queries.GetListBireyselMusteri;

public record GetListBireyselMusteriQuery : IRequest<PaginatedResult<GetListBireyselMusteriResponse>>
{
    public int PageSize { get; init; } = 10;
    public int PageIndex { get; init; } = 0;
    public string? SearchTerm { get; init; }
} 