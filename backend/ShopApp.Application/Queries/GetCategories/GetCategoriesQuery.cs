using System.Collections.Generic;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Queries.GetCategories;

public class GetCategoriesQuery : IRequest<List<CategoryDto>>
{
    // Sayfalama ve filtreleme özellikleri eklenebilir
} 