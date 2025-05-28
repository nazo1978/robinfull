using MediatR;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.UpdateKurumsalMusteri;

public record UpdateKurumsalMusteriCommand : IRequest<UpdateKurumsalMusteriResponse>
{
    public Guid Id { get; init; }
    public string Ad { get; init; }
    public string Soyad { get; init; }
    public string Email { get; init; }
    public string Telefon { get; init; }
    public string Adres { get; init; }
    public string FirmaAdi { get; init; }
    public string VergiDairesi { get; init; }
    public string VergiNo { get; init; }
    public string FaaliyetAlani { get; init; }
    public string YetkiliKisiAdi { get; init; }
    public string YetkiliKisiSoyadi { get; init; }
    public string YetkiliKisiTelefonu { get; init; }
    public string YetkiliKisiEmail { get; init; }
}
