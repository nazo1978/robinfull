using System;
using System.Collections.Generic;
using ShopApp.Core.Common;
using ShopApp.Domain.Enums;

namespace ShopApp.Domain.Entities;

public class Discount : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
    public DiscountType DiscountType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public decimal MinimumPurchaseAmount { get; set; }
    
    // Ürün veya kategori bazlı indirim
    public Guid? ProductId { get; set; }
    public Product Product { get; set; }
    public Guid? CategoryId { get; set; }
    public Category Category { get; set; }
    
    // İndirim kuralları
    public ICollection<DiscountRule> Rules { get; set; } = new List<DiscountRule>();
}
