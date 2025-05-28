using AutoMapper;
using MediatR;
using ShopApp.Application.Features.BireyselMusteriler.Rules;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.BireyselMusteriler.Commands.UpdateBireyselMusteri;

public class UpdateBireyselMusteriCommandHandler : IRequestHandler<UpdateBireyselMusteriCommand, UpdateBireyselMusteriResponse>
{
    private readonly IAsyncRepository<BireyselMusteri> _bireyselMusteriRepository;
    private readonly IMapper _mapper;
    private readonly BireyselMusteriBusinessRules _bireyselMusteriBusinessRules;

    public UpdateBireyselMusteriCommandHandler(IAsyncRepository<BireyselMusteri> bireyselMusteriRepository, IMapper mapper, BireyselMusteriBusinessRules bireyselMusteriBusinessRules)
    {
        _bireyselMusteriRepository = bireyselMusteriRepository;
        _mapper = mapper;
        _bireyselMusteriBusinessRules = bireyselMusteriBusinessRules;
    }

    public async Task<UpdateBireyselMusteriResponse> Handle(UpdateBireyselMusteriCommand request, CancellationToken cancellationToken)
    {
        BireyselMusteri? bireyselMusteri = await _bireyselMusteriRepository.GetByIdAsync(request.Id);
        await _bireyselMusteriBusinessRules.BireyselMusteriShouldExistAsync(bireyselMusteri);
        await _bireyselMusteriBusinessRules.TCKNShouldNotExistWithDifferentIdAsync(request.Id, request.TCKN);
        await _bireyselMusteriBusinessRules.EmailShouldNotExistWithDifferentIdAsync(request.Id, request.Email);

        _mapper.Map(request, bireyselMusteri);
        await _bireyselMusteriRepository.UpdateAsync(bireyselMusteri);

        UpdateBireyselMusteriResponse response = _mapper.Map<UpdateBireyselMusteriResponse>(bireyselMusteri);
        return response;
    }
}