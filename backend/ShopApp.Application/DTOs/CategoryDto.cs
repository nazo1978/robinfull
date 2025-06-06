using System;
using System.Collections.Generic;

namespace ShopApp.Application.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
    public ICollection<ProductDto> Products { get; set; } = new List<ProductDto>();
}