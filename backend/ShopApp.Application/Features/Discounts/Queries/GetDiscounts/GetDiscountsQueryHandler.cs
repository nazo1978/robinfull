using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Services.Repositories;
using ShopApp.Core.Pagination;

namespace ShopApp.Application.Features.Discounts.Queries.GetDiscounts;

public class GetDiscountsQueryHandler : IRequestHandler<GetDiscountsQuery, PaginatedResult<GetDiscountsResponse>>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly IMapper _mapper;

    public GetDiscountsQueryHandler(
        IDiscountRepository discountRepository,
        IMapper mapper)
    {
        _discountRepository = discountRepository;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetDiscountsResponse>> Handle(GetDiscountsQuery request, CancellationToken cancellationToken)
    {
        var discounts = await _discountRepository.GetDiscountsAsync(request.PageIndex, request.PageSize, cancellationToken);
        
        var discountResponses = discounts.Items.Select(d => {
            var response = _mapper.Map<GetDiscountsResponse>(d);
            
            // Ürün ve kategori adlarını ekle
            if (d.Product != null)
                response.ProductName = d.Product.Name;
                
            if (d.Category != null)
                response.CategoryName = d.Category.Name;
                
            return response;
        }).ToList();
        
        return new PaginatedResult<GetDiscountsResponse>(
            discountResponses,
            discounts.TotalCount,
            request.PageIndex,
            request.PageSize);
    }
}
