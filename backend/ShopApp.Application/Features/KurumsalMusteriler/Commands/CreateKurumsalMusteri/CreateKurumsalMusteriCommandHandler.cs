using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using ShopApp.Application.Features.KurumsalMusteriler.Rules;
using ShopApp.Application.Interfaces;
using ShopApp.Core.Security.Hashing;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;

public class CreateKurumsalMusteriCommandHandler : IRequestHandler<CreateKurumsalMusteriCommand, CreateKurumsalMusteriResponse>
{
    private readonly IKurumsalMusteriRepository _kurumsalMusteriRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly KurumsalMusteriBusinessRules _kurumsalMusteriBusinessRules;

    public CreateKurumsalMusteriCommandHandler(
        IKurumsalMusteriRepository kurumsalMusteriRepository,
        IUserRepository userRepository,
        IMapper mapper,
        KurumsalMusteriBusinessRules kurumsalMusteriBusinessRules)
    {
        _kurumsalMusteriRepository = kurumsalMusteriRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _kurumsalMusteriBusinessRules = kurumsalMusteriBusinessRules;
    }

    public async Task<CreateKurumsalMusteriResponse> Handle(CreateKurumsalMusteriCommand request, CancellationToken cancellationToken)
    {
        // İş kurallarını kontrol et
        await _kurumsalMusteriBusinessRules.VergiNoShouldNotExistAsync(request.VergiNo);
        await _kurumsalMusteriBusinessRules.EmailShouldNotExistAsync(request.Email);

        // Kullanıcı adı ve e-posta adresi benzersiz olmalı
        var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUsername is not null)
            throw new Exception("Bu kullanıcı adı zaten kullanılıyor.");

        var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
        if (existingEmail is not null)
            throw new Exception("Bu e-posta adresi zaten kullanılıyor.");

        // KurumsalMusteri nesnesini oluştur
        KurumsalMusteri kurumsalMusteri = _mapper.Map<KurumsalMusteri>(request);

        // User ve ApplicationUser alanlarını doldur
        kurumsalMusteri.Username = request.Username;
        kurumsalMusteri.Email = request.Email;

        // Şifreyi hashle
        HashingHelper.CreatePasswordHash(request.Password, out string passwordHash, out string passwordSalt);
        kurumsalMusteri.PasswordHash = passwordHash;
        kurumsalMusteri.PasswordSalt = passwordSalt;
        kurumsalMusteri.EmailConfirmed = false;
        kurumsalMusteri.LastLoginDate = DateTime.Now;
        kurumsalMusteri.IsActive = true;
        kurumsalMusteri.IsDeleted = false;

        // ApplicationUser alanlarını doldur
        kurumsalMusteri.FirstName = request.Ad;
        kurumsalMusteri.LastName = request.Soyad;
        kurumsalMusteri.PhoneNumber = request.Telefon;
        kurumsalMusteri.Address = request.Adres;
        kurumsalMusteri.RegistrationDate = DateTime.Now;

        // Müşteri alanlarını doldur
        kurumsalMusteri.KayitTarihi = DateTime.Now;
        kurumsalMusteri.AktifMi = true;

        // Veritabanına kaydet
        await _kurumsalMusteriRepository.AddAsync(kurumsalMusteri);

        // Yanıt oluştur
        CreateKurumsalMusteriResponse response = _mapper.Map<CreateKurumsalMusteriResponse>(kurumsalMusteri);
        return response;
    }
}
