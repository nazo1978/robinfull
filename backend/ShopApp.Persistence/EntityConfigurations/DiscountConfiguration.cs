using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
{
    public void Configure(EntityTypeBuilder<Discount> builder)
    {
        builder.HasKey(d => d.Id);
        
        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(d => d.Description)
            .HasMaxLength(500);
            
        builder.Property(d => d.DiscountType)
            .IsRequired();
            
        builder.Property(d => d.StartDate)
            .IsRequired();
            
        builder.Property(d => d.EndDate)
            .IsRequired();
            
        builder.Property(d => d.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(d => d.MinimumPurchaseAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);
            
        // İlişkiler
        builder.HasOne(d => d.Product)
            .WithMany()
            .HasForeignKey(d => d.ProductId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
            
        builder.HasOne(d => d.Category)
            .WithMany()
            .HasForeignKey(d => d.CategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
            
        builder.HasMany(d => d.Rules)
            .WithOne(r => r.Discount)
            .HasForeignKey(r => r.DiscountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
