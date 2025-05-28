using MediatR;
using ShopApp.Core.Application.Security;
using ShopApp.Core.Security.Roles;
using System;

namespace ShopApp.Application.Features.BireyselMusteriler.Queries.GetByIdBireyselMusteri;

public record GetByIdBireyselMusteriQuery : IRequest<GetByIdBireyselMusteriResponse>, ISecuredRequest
{
    public Guid Id { get; init; }

    // Sadece Admin ve BireyselMusteri rolüne sahip kullanıcılar erişebilir
    public string[] Roles => new[] { Role.Admin, Role.BireyselMusteri };
}