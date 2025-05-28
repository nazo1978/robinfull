using System.Collections.Generic;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Queries.GetProducts;

public class GetProductsQuery : IRequest<List<ProductDto>>
{
    // Sayfalama ve filtreleme özellikleri eklenebilir
}