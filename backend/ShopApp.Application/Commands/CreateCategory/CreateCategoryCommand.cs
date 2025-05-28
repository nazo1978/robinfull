using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Commands.CreateCategory;

public class CreateCategoryCommand : IRequest<CategoryDto>
{
    public string Name { get; set; }
    public string Description { get; set; }
} 