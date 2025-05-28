using System.Linq.Expressions;
using AutoMapper;
using MediatR;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.BireyselMusteriler.Queries.GetListBireyselMusteri;

public class GetListBireyselMusteriQueryHandler : IRequestHandler<GetListBireyselMusteriQuery, PaginatedResult<GetListBireyselMusteriResponse>>
{
    private readonly IAsyncRepository<BireyselMusteri> _bireyselMusteriRepository;
    private readonly IMapper _mapper;

    public GetListBireyselMusteriQueryHandler(IAsyncRepository<BireyselMusteri> bireyselMusteriRepository, IMapper mapper)
    {
        _bireyselMusteriRepository = bireyselMusteriRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetListBireyselMusteriResponse>> Handle(GetListBireyselMusteriQuery request, CancellationToken cancellationToken)
    {
        Expression<Func<BireyselMusteri, bool>> predicate = x => true;

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            predicate = x => x.Ad.Contains(request.SearchTerm) ||
                               x.Soyad.Contains(request.SearchTerm) ||
                               x.Email.Contains(request.SearchTerm) ||
                               x.TCKN.Contains(request.SearchTerm);
        }

        var pagedList = await _bireyselMusteriRepository.GetPagedListAsync(
            predicate,
            request.PageIndex + 1, // PagedList uses 1-based indexing
            request.PageSize,
            orderBy: x => x.OrderByDescending(m => m.KayitTarihi),
            includeString: null,
            disableTracking: true,
            cancellationToken: cancellationToken
        );

        var mappedItems = _mapper.Map<List<GetListBireyselMusteriResponse>>(pagedList.Items);

        var mappedResult = new PaginatedResult<GetListBireyselMusteriResponse>(
            mappedItems,
            pagedList.TotalCount,
            request.PageIndex,
            request.PageSize
        );

        return mappedResult;
    }
}