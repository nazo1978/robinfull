using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Commands.UpdateProduct;

public class UpdateProductCommand : IRequest<ProductDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; }
    public string ImageUrl { get; set; }
    public string ImageAlt { get; set; }
    public Guid CategoryId { get; set; }
}
