using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class DiscountRuleConfiguration : IEntityTypeConfiguration<DiscountRule>
{
    public void Configure(EntityTypeBuilder<DiscountRule> builder)
    {
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.MinimumQuantity)
            .IsRequired()
            .HasDefaultValue(1);
            
        builder.Property(r => r.DiscountRate)
            .IsRequired()
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);
            
        builder.Property(r => r.DiscountAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired(false);
            
        // İlişkiler
        builder.HasOne(r => r.Discount)
            .WithMany(d => d.Rules)
            .HasForeignKey(r => r.DiscountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
