using System;
using System.Threading.Tasks;
using ShopApp.Application.Features.KurumsalMusteriler.Constants;
using ShopApp.Application.Interfaces;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Rules;

public class KurumsalMusteriBusinessRules
{
    private readonly IKurumsalMusteriRepository _kurumsalMusteriRepository;

    public KurumsalMusteriBusinessRules(IKurumsalMusteriRepository kurumsalMusteriRepository)
    {
        _kurumsalMusteriRepository = kurumsalMusteriRepository;
    }

    public async Task KurumsalMusteriShouldExistAsync(KurumsalMusteri? kurumsalMusteri)
    {
        if (kurumsalMusteri is null)
            throw new NotFoundException(KurumsalMusteriMessages.NotFound);
    }

    public async Task VergiNoShouldNotExistAsync(string vergiNo)
    {
        var kurumsalMusteri = await _kurumsalMusteriRepository.GetAsync(k => k.VergiNo == vergiNo);
        if (kurumsalMusteri is not null)
            throw new BusinessException(KurumsalMusteriMessages.VergiNoAlreadyExists);
    }

    public async Task EmailShouldNotExistAsync(string email)
    {
        var kurumsalMusteri = await _kurumsalMusteriRepository.GetAsync(k => k.Email == email);
        if (kurumsalMusteri is not null)
            throw new BusinessException(KurumsalMusteriMessages.EmailAlreadyExists);
    }

    public async Task VergiNoShouldNotExistWithDifferentIdAsync(Guid id, string vergiNo)
    {
        var kurumsalMusteri = await _kurumsalMusteriRepository.GetAsync(k => k.VergiNo == vergiNo && k.Id != id);
        if (kurumsalMusteri is not null)
            throw new BusinessException(KurumsalMusteriMessages.VergiNoAlreadyExists);
    }

    public async Task EmailShouldNotExistWithDifferentIdAsync(Guid id, string email)
    {
        var kurumsalMusteri = await _kurumsalMusteriRepository.GetAsync(k => k.Email == email && k.Id != id);
        if (kurumsalMusteri is not null)
            throw new BusinessException(KurumsalMusteriMessages.EmailAlreadyExists);
    }
}
