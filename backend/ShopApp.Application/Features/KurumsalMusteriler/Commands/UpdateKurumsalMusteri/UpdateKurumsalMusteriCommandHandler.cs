using AutoMapper;
using MediatR;
using ShopApp.Application.Features.KurumsalMusteriler.Rules;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.UpdateKurumsalMusteri;

public class UpdateKurumsalMusteriCommandHandler : IRequestHandler<UpdateKurumsalMusteriCommand, UpdateKurumsalMusteriResponse>
{
    private readonly IAsyncRepository<KurumsalMusteri> _kurumsalMusteriRepository;
    private readonly IMapper _mapper;
    private readonly KurumsalMusteriBusinessRules _kurumsalMusteriBusinessRules;

    public UpdateKurumsalMusteriCommandHandler(
        IAsyncRepository<KurumsalMusteri> kurumsalMusteriRepository,
        IMapper mapper,
        KurumsalMusteriBusinessRules kurumsalMusteriBusinessRules)
    {
        _kurumsalMusteriRepository = kurumsalMusteriRepository;
        _mapper = mapper;
        _kurumsalMusteriBusinessRules = kurumsalMusteriBusinessRules;
    }

    public async Task<UpdateKurumsalMusteriResponse> Handle(UpdateKurumsalMusteriCommand request, CancellationToken cancellationToken)
    {
        KurumsalMusteri? kurumsalMusteri = await _kurumsalMusteriRepository.GetByIdAsync(request.Id);
        await _kurumsalMusteriBusinessRules.KurumsalMusteriShouldExistAsync(kurumsalMusteri);
        await _kurumsalMusteriBusinessRules.VergiNoShouldNotExistWithDifferentIdAsync(request.Id, request.VergiNo);
        await _kurumsalMusteriBusinessRules.EmailShouldNotExistWithDifferentIdAsync(request.Id, request.Email);

        _mapper.Map(request, kurumsalMusteri);
        await _kurumsalMusteriRepository.UpdateAsync(kurumsalMusteri);

        UpdateKurumsalMusteriResponse response = _mapper.Map<UpdateKurumsalMusteriResponse>(kurumsalMusteri);
        return response;
    }
}
