using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Commands.UpdateCategory;

public class UpdateCategoryCommand : IRequest<CategoryDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
}
