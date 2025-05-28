using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public string ImageUrl { get; set; } = "https://picsum.photos/400/300";
    public string ImageAlt { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; }
}