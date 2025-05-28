using AutoMapper;
using MediatR;
using ShopApp.Application.Features.KurumsalMusteriler.Rules;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Queries.GetByIdKurumsalMusteri;

public class GetByIdKurumsalMusteriQueryHandler : IRequestHandler<GetByIdKurumsalMusteriQuery, GetByIdKurumsalMusteriResponse>
{
    private readonly IAsyncRepository<KurumsalMusteri> _kurumsalMusteriRepository;
    private readonly IMapper _mapper;
    private readonly KurumsalMusteriBusinessRules _kurumsalMusteriBusinessRules;

    public GetByIdKurumsalMusteriQueryHandler(
        IAsyncRepository<KurumsalMusteri> kurumsalMusteriRepository,
        IMapper mapper,
        KurumsalMusteriBusinessRules kurumsalMusteriBusinessRules)
    {
        _kurumsalMusteriRepository = kurumsalMusteriRepository;
        _mapper = mapper;
        _kurumsalMusteriBusinessRules = kurumsalMusteriBusinessRules;
    }

    public async Task<GetByIdKurumsalMusteriResponse> Handle(GetByIdKurumsalMusteriQuery request, CancellationToken cancellationToken)
    {
        KurumsalMusteri? kurumsalMusteri = await _kurumsalMusteriRepository.GetByIdAsync(request.Id);
        await _kurumsalMusteriBusinessRules.KurumsalMusteriShouldExistAsync(kurumsalMusteri);

        GetByIdKurumsalMusteriResponse response = _mapper.Map<GetByIdKurumsalMusteriResponse>(kurumsalMusteri);
        return response;
    }
}
