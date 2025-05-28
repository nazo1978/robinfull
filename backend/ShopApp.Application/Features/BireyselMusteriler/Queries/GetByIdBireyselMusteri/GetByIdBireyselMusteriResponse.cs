namespace ShopApp.Application.Features.BireyselMusteriler.Queries.GetByIdBireyselMusteri;

public record GetByIdBireyselMusteriResponse
{
    public Guid Id { get; init; }
    public string Ad { get; init; }
    public string Soyad { get; init; }
    public string Email { get; init; }
    public string Telefon { get; init; }
    public string Adres { get; init; }
    public string TCKN { get; init; }
    public DateTime DogumTarihi { get; init; }
    public string Cinsiyet { get; init; }
    public string MedeniDurum { get; init; }
    public string MeslekBilgisi { get; init; }
    public DateTime KayitTarihi { get; init; }
    public bool AktifMi { get; init; }
} 