using System;
using MediatR;
using ShopApp.Application.Features.BireyselMusteriler.Constants;

namespace ShopApp.Application.Features.BireyselMusteriler.Commands.CreateBireyselMusteri;

public record CreateBireyselMusteriCommand : IRequest<CreateBireyselMusteriResponse>
{
    // User bilgileri
    public string Username { get; init; }
    public string Password { get; init; }

    // Müşteri bilgileri
    public string Ad { get; init; }
    public string Soyad { get; init; }
    public string Email { get; init; }
    public string Telefon { get; init; }
    public string Adres { get; init; }

    // BireyselMusteri bilgileri
    public string TCKN { get; init; }
    public DateTime DogumTarihi { get; init; }
    public string Cinsiyet { get; init; }
    public string MedeniDurum { get; init; }
    public string MeslekBilgisi { get; init; }
}