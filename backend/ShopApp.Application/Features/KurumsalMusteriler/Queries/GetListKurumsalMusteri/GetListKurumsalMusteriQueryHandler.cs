using System.Linq.Expressions;
using AutoMapper;
using MediatR;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Queries.GetListKurumsalMusteri;

public class GetListKurumsalMusteriQueryHandler : IRequestHandler<GetListKurumsalMusteriQuery, PaginatedResult<GetListKurumsalMusteriResponse>>
{
    private readonly IAsyncRepository<KurumsalMusteri> _kurumsalMusteriRepository;
    private readonly IMapper _mapper;

    public GetListKurumsalMusteriQueryHandler(IAsyncRepository<KurumsalMusteri> kurumsalMusteriRepository, IMapper mapper)
    {
        _kurumsalMusteriRepository = kurumsalMusteriRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetListKurumsalMusteriResponse>> Handle(GetListKurumsalMusteriQuery request, CancellationToken cancellationToken)
    {
        Expression<Func<KurumsalMusteri, bool>> predicate = x => true;

        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            predicate = x => x.Ad.Contains(request.SearchTerm) ||
                               x.Soyad.Contains(request.SearchTerm) ||
                               x.Email.Contains(request.SearchTerm) ||
                               x.FirmaAdi.Contains(request.SearchTerm) ||
                               x.VergiNo.Contains(request.SearchTerm);
        }

        var pagedList = await _kurumsalMusteriRepository.GetPagedListAsync(
            predicate,
            request.PageIndex + 1, // PagedList uses 1-based indexing
            request.PageSize,
            orderBy: x => x.OrderByDescending(m => m.KayitTarihi),
            includeString: null,
            disableTracking: true,
            cancellationToken: cancellationToken
        );

        var mappedItems = _mapper.Map<List<GetListKurumsalMusteriResponse>>(pagedList.Items);

        return new PaginatedResult<GetListKurumsalMusteriResponse>(
            mappedItems,
            pagedList.TotalCount,
            request.PageIndex,
            request.PageSize
        );
    }
}
