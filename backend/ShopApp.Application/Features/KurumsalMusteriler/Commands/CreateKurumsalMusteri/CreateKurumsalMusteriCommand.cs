using System;
using MediatR;
using ShopApp.Application.Features.KurumsalMusteriler.Constants;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;

public record CreateKurumsalMusteriCommand : IRequest<CreateKurumsalMusteriResponse>
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

    // KurumsalMusteri bilgileri
    public string FirmaAdi { get; init; }
    public string VergiDairesi { get; init; }
    public string VergiNo { get; init; }
    public string FaaliyetAlani { get; init; }
    public string YetkiliKisiAdi { get; init; }
    public string YetkiliKisiSoyadi { get; init; }
    public string YetkiliKisiTelefonu { get; init; }
    public string YetkiliKisiEmail { get; init; }
}