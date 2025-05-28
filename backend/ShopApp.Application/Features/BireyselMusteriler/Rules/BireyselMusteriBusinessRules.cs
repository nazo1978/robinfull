using System;
using System.Threading.Tasks;
using ShopApp.Application.Features.BireyselMusteriler.Constants;
using ShopApp.Application.Interfaces;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.BireyselMusteriler.Rules;

public class BireyselMusteriBusinessRules
{
    private readonly IBireyselMusteriRepository _bireyselMusteriRepository;

    public BireyselMusteriBusinessRules(IBireyselMusteriRepository bireyselMusteriRepository)
    {
        _bireyselMusteriRepository = bireyselMusteriRepository;
    }

    public async Task BireyselMusteriShouldExistAsync(BireyselMusteri? bireyselMusteri)
    {
        if (bireyselMusteri is null)
            throw new NotFoundException(BireyselMusteriMessages.NotFound);
    }

    public async Task TCKNShouldNotExistAsync(string tckn)
    {
        var bireyselMusteri = await _bireyselMusteriRepository.GetAsync(b => b.TCKN == tckn);
        if (bireyselMusteri is not null)
            throw new BusinessException(BireyselMusteriMessages.TCKNAlreadyExists);
    }

    public async Task EmailShouldNotExistAsync(string email)
    {
        var bireyselMusteri = await _bireyselMusteriRepository.GetAsync(b => b.Email == email);
        if (bireyselMusteri is not null)
            throw new BusinessException(BireyselMusteriMessages.EmailAlreadyExists);
    }

    public async Task TCKNShouldNotExistWithDifferentIdAsync(Guid id, string tckn)
    {
        var bireyselMusteri = await _bireyselMusteriRepository.GetAsync(b => b.TCKN == tckn && b.Id != id);
        if (bireyselMusteri is not null)
            throw new BusinessException(BireyselMusteriMessages.TCKNAlreadyExists);
    }

    public async Task EmailShouldNotExistWithDifferentIdAsync(Guid id, string email)
    {
        var bireyselMusteri = await _bireyselMusteriRepository.GetAsync(b => b.Email == email && b.Id != id);
        if (bireyselMusteri is not null)
            throw new BusinessException(BireyselMusteriMessages.EmailAlreadyExists);
    }
}