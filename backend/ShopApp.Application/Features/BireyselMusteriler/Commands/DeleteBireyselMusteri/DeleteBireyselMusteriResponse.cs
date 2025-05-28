namespace ShopApp.Application.Features.BireyselMusteriler.Commands.DeleteBireyselMusteri;

public record DeleteBireyselMusteriResponse
{
    public Guid Id { get; init; }
    public bool IsDeleted { get; init; }
} 