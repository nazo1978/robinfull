using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using ShopApp.Application.Features.BireyselMusteriler.Rules;
using ShopApp.Application.Interfaces;
using ShopApp.Core.Security.Hashing;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.BireyselMusteriler.Commands.CreateBireyselMusteri;

public class CreateBireyselMusteriCommandHandler : IRequestHandler<CreateBireyselMusteriCommand, CreateBireyselMusteriResponse>
{
    private readonly IBireyselMusteriRepository _bireyselMusteriRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly BireyselMusteriBusinessRules _bireyselMusteriBusinessRules;

    public CreateBireyselMusteriCommandHandler(
        IBireyselMusteriRepository bireyselMusteriRepository,
        IUserRepository userRepository,
        IMapper mapper,
        BireyselMusteriBusinessRules bireyselMusteriBusinessRules)
    {
        _bireyselMusteriRepository = bireyselMusteriRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _bireyselMusteriBusinessRules = bireyselMusteriBusinessRules;
    }

    public async Task<CreateBireyselMusteriResponse> Handle(CreateBireyselMusteriCommand request, CancellationToken cancellationToken)
    {
        // İş kurallarını kontrol et
        await _bireyselMusteriBusinessRules.TCKNShouldNotExistAsync(request.TCKN);
        await _bireyselMusteriBusinessRules.EmailShouldNotExistAsync(request.Email);

        // Kullanıcı adı ve e-posta adresi benzersiz olmalı
        var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUsername is not null)
            throw new Exception("Bu kullanıcı adı zaten kullanılıyor.");

        var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
        if (existingEmail is not null)
            throw new Exception("Bu e-posta adresi zaten kullanılıyor.");

        // BireyselMusteri nesnesini oluştur
        BireyselMusteri bireyselMusteri = _mapper.Map<BireyselMusteri>(request);

        // User ve ApplicationUser alanlarını doldur
        bireyselMusteri.Username = request.Username;
        bireyselMusteri.Email = request.Email;

        // Şifreyi hashle
        HashingHelper.CreatePasswordHash(request.Password, out string passwordHash, out string passwordSalt);
        bireyselMusteri.PasswordHash = passwordHash;
        bireyselMusteri.PasswordSalt = passwordSalt;
        bireyselMusteri.EmailConfirmed = false;
        bireyselMusteri.LastLoginDate = DateTime.UtcNow;
        bireyselMusteri.IsActive = true;
        bireyselMusteri.IsDeleted = false;

        // ApplicationUser alanlarını doldur
        bireyselMusteri.FirstName = request.Ad;
        bireyselMusteri.LastName = request.Soyad;
        bireyselMusteri.PhoneNumber = request.Telefon;
        bireyselMusteri.Address = request.Adres;
        bireyselMusteri.RegistrationDate = DateTime.UtcNow;
        bireyselMusteri.UserType = "BireyselMusteri";

        // Müşteri alanlarını doldur
        bireyselMusteri.KayitTarihi = DateTime.UtcNow;
        bireyselMusteri.AktifMi = true;

        // DogumTarihi'ni UTC olarak ayarla
        bireyselMusteri.DogumTarihi = DateTime.SpecifyKind(request.DogumTarihi, DateTimeKind.Utc);

        // Veritabanına kaydet
        await _bireyselMusteriRepository.AddAsync(bireyselMusteri);

        // Yanıt oluştur
        CreateBireyselMusteriResponse response = _mapper.Map<CreateBireyselMusteriResponse>(bireyselMusteri);
        return response;
    }
}