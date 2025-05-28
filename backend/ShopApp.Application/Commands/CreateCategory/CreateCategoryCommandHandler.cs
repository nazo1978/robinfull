using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Commands.CreateCategory;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive
        };

        await _context.Categories.AddAsync(category, cancellationToken);
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