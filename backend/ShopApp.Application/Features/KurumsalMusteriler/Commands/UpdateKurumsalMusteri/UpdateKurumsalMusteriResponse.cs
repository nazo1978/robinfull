namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.UpdateKurumsalMusteri;

public record UpdateKurumsalMusteriResponse
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
    public DateTime KayitTarihi { get; init; }
    public bool AktifMi { get; init; }
}
