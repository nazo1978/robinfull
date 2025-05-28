namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;

public record CreateKurumsalMusteriResponse
{
    public Guid Id { get; init; }
    public string Ad { get; init; }
    public string Soyad { get; init; }
    public string Email { get; init; }
    public string Telefon { get; init; }
    public string FirmaAdi { get; init; }
    public string VergiNo { get; init; }
    public DateTime KayitTarihi { get; init; }
}
