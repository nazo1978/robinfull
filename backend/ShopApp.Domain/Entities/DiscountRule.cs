using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class DiscountRule : BaseEntity
{
    public Guid DiscountId { get; set; }
    public Discount Discount { get; set; }
    
    // Minimum ürün adedi
    public int MinimumQuantity { get; set; }
    
    // İndirim oranı (yüzde olarak, örn: 10 = %10)
    public decimal DiscountRate { get; set; }
    
    // Sabit indirim tutarı (DiscountType = FixedAmount ise kullanılır)
    public decimal? DiscountAmount { get; set; }
}
