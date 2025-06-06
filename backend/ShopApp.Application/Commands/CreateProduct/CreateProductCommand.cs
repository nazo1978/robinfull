using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Commands.CreateProduct;

public class CreateProductCommand : IRequest<ProductDto>
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public string ImageUrl { get; set; } = "https://picsum.photos/400/300";
    public string ImageAlt { get; set; }
    public Guid CategoryId { get; set; }
}