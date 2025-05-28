namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.DeleteKurumsalMusteri;

public record DeleteKurumsalMusteriResponse
{
    public Guid Id { get; init; }
    public bool IsDeleted { get; init; }
}
