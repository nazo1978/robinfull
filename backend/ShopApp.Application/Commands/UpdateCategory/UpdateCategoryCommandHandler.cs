using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;

namespace ShopApp.Application.Commands.UpdateCategory;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null)
        {
            throw new Exception($"Category with ID {request.Id} not found");
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        category.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IsActive = category.IsActive,
            CreatedDate = category.CreatedDate,
            ModifiedDate = category.ModifiedDate
        };
    }
}
