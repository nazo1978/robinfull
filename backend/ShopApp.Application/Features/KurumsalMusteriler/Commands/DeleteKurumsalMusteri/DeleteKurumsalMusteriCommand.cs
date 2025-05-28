using MediatR;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.DeleteKurumsalMusteri;

public record DeleteKurumsalMusteriCommand : IRequest<DeleteKurumsalMusteriResponse>
{
    public Guid Id { get; init; }
}
