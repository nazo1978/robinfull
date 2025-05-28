using AutoMapper;
using MediatR;
using ShopApp.Application.Features.BireyselMusteriler.Rules;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.BireyselMusteriler.Commands.DeleteBireyselMusteri;

public class DeleteBireyselMusteriCommandHandler : IRequestHandler<DeleteBireyselMusteriCommand, DeleteBireyselMusteriResponse>
{
    private readonly IAsyncRepository<BireyselMusteri> _bireyselMusteriRepository;
    private readonly IMapper _mapper;
    private readonly BireyselMusteriBusinessRules _bireyselMusteriBusinessRules;

    public DeleteBireyselMusteriCommandHandler(IAsyncRepository<BireyselMusteri> bireyselMusteriRepository, IMapper mapper, BireyselMusteriBusinessRules bireyselMusteriBusinessRules)
    {
        _bireyselMusteriRepository = bireyselMusteriRepository;
        _mapper = mapper;
        _bireyselMusteriBusinessRules = bireyselMusteriBusinessRules;
    }

    public async Task<DeleteBireyselMusteriResponse> Handle(DeleteBireyselMusteriCommand request, CancellationToken cancellationToken)
    {
        BireyselMusteri? bireyselMusteri = await _bireyselMusteriRepository.GetByIdAsync(request.Id);
        await _bireyselMusteriBusinessRules.BireyselMusteriShouldExistAsync(bireyselMusteri);

        await _bireyselMusteriRepository.DeleteAsync(bireyselMusteri);

        DeleteBireyselMusteriResponse response = _mapper.Map<DeleteBireyselMusteriResponse>(bireyselMusteri);
        return response;
    }
}