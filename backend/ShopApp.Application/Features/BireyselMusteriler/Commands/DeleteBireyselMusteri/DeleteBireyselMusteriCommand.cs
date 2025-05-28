using MediatR;

namespace ShopApp.Application.Features.BireyselMusteriler.Commands.DeleteBireyselMusteri;

public record DeleteBireyselMusteriCommand : IRequest<DeleteBireyselMusteriResponse>
{
    public Guid Id { get; init; }
} 