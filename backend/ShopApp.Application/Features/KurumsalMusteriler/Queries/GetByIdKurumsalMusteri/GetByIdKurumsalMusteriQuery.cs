using MediatR;

namespace ShopApp.Application.Features.KurumsalMusteriler.Queries.GetByIdKurumsalMusteri;

public record GetByIdKurumsalMusteriQuery : IRequest<GetByIdKurumsalMusteriResponse>
{
    public Guid Id { get; init; }
}
