using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;

namespace ShopApp.Application.Commands.UpdateProduct;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            throw new Exception($"Product with ID {request.Id} not found");
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.IsActive = request.IsActive;
        product.ImageUrl = request.ImageUrl ?? product.ImageUrl;
        product.ImageAlt = request.ImageAlt ?? product.ImageAlt;
        product.CategoryId = request.CategoryId;
        product.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            IsActive = product.IsActive,
            ImageUrl = product.ImageUrl,
            ImageAlt = product.ImageAlt,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name,
            CreatedDate = product.CreatedDate,
            ModifiedDate = product.ModifiedDate
        };
    }
}
