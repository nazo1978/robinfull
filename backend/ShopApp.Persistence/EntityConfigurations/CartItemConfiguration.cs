using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasKey(ci => ci.Id);
        
        builder.Property(ci => ci.Quantity)
            .IsRequired();
            
        builder.Property(ci => ci.UnitPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");
            
        // İndirim alanları
        builder.Property(ci => ci.DiscountRate)
            .IsRequired()
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);
            
        builder.Property(ci => ci.DiscountAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);
            
        builder.Property(ci => ci.OriginalTotalPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");
            
        builder.Property(ci => ci.TotalPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");
            
        // İlişkiler
        builder.HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(ci => ci.Product)
            .WithMany()
            .HasForeignKey(ci => ci.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(ci => ci.AppliedDiscount)
            .WithMany()
            .HasForeignKey(ci => ci.AppliedDiscountId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}
