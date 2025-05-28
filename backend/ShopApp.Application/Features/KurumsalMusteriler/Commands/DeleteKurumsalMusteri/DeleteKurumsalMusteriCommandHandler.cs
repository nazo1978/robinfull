using AutoMapper;
using MediatR;
using ShopApp.Application.Features.KurumsalMusteriler.Rules;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.DeleteKurumsalMusteri;

public class DeleteKurumsalMusteriCommandHandler : IRequestHandler<DeleteKurumsalMusteriCommand, DeleteKurumsalMusteriResponse>
{
    private readonly IAsyncRepository<KurumsalMusteri> _kurumsalMusteriRepository;
    private readonly IMapper _mapper;
    private readonly KurumsalMusteriBusinessRules _kurumsalMusteriBusinessRules;

    public DeleteKurumsalMusteriCommandHandler(
        IAsyncRepository<KurumsalMusteri> kurumsalMusteriRepository,
        IMapper mapper,
        KurumsalMusteriBusinessRules kurumsalMusteriBusinessRules)
    {
        _kurumsalMusteriRepository = kurumsalMusteriRepository;
        _mapper = mapper;
        _kurumsalMusteriBusinessRules = kurumsalMusteriBusinessRules;
    }

    public async Task<DeleteKurumsalMusteriResponse> Handle(DeleteKurumsalMusteriCommand request, CancellationToken cancellationToken)
    {
        KurumsalMusteri? kurumsalMusteri = await _kurumsalMusteriRepository.GetByIdAsync(request.Id);
        await _kurumsalMusteriBusinessRules.KurumsalMusteriShouldExistAsync(kurumsalMusteri);

        await _kurumsalMusteriRepository.DeleteAsync(kurumsalMusteri);

        DeleteKurumsalMusteriResponse response = _mapper.Map<DeleteKurumsalMusteriResponse>(kurumsalMusteri);
        return response;
    }
}
