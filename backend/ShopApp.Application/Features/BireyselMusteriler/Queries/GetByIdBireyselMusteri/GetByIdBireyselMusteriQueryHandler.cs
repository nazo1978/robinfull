using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using ShopApp.Application.Features.BireyselMusteriler.Rules;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Security.Roles;
using ShopApp.Domain.Entities;
using System.Security.Claims;

namespace ShopApp.Application.Features.BireyselMusteriler.Queries.GetByIdBireyselMusteri;

public class GetByIdBireyselMusteriQueryHandler : IRequestHandler<GetByIdBireyselMusteriQuery, GetByIdBireyselMusteriResponse>
{
    private readonly IAsyncRepository<BireyselMusteri> _bireyselMusteriRepository;
    private readonly IMapper _mapper;
    private readonly BireyselMusteriBusinessRules _bireyselMusteriBusinessRules;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetByIdBireyselMusteriQueryHandler(
        IAsyncRepository<BireyselMusteri> bireyselMusteriRepository,
        IMapper mapper,
        BireyselMusteriBusinessRules bireyselMusteriBusinessRules,
        IHttpContextAccessor httpContextAccessor)
    {
        _bireyselMusteriRepository = bireyselMusteriRepository;
        _mapper = mapper;
        _bireyselMusteriBusinessRules = bireyselMusteriBusinessRules;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GetByIdBireyselMusteriResponse> Handle(GetByIdBireyselMusteriQuery request, CancellationToken cancellationToken)
    {
        BireyselMusteri? bireyselMusteri = await _bireyselMusteriRepository.GetByIdAsync(request.Id);
        await _bireyselMusteriBusinessRules.BireyselMusteriShouldExistAsync(bireyselMusteri);

        // Eğer kullanıcı Admin değilse ve BireyselMusteri ise, sadece kendi verilerine erişebilir
        var user = _httpContextAccessor.HttpContext?.User;
        if (user != null && !user.IsInRole(Role.Admin) && user.IsInRole(Role.BireyselMusteri))
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != bireyselMusteri.Id.ToString())
            {
                throw new AuthorizationException("You are not authorized to access this customer's data.");
            }
        }

        GetByIdBireyselMusteriResponse response = _mapper.Map<GetByIdBireyselMusteriResponse>(bireyselMusteri);
        return response;
    }
}