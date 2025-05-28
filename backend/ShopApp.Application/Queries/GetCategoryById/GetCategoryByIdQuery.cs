using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Queries.GetCategoryById;

public class GetCategoryByIdQuery : IRequest<CategoryDto>
{
    public Guid Id { get; set; }
    
    public GetCategoryByIdQuery(Guid id)
    {
        Id = id;
    }
} 