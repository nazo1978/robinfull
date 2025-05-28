namespace ShopApp.Application.Features.BireyselMusteriler.Queries.GetListBireyselMusteri;

public record GetListBireyselMusteriResponse
{
    public Guid Id { get; init; }
    public string Ad { get; init; }
    public string Soyad { get; init; }
    public string Email { get; init; }
    public string Telefon { get; init; }
    public string TCKN { get; init; }
    public DateTime KayitTarihi { get; init; }
    public bool AktifMi { get; init; }
} 