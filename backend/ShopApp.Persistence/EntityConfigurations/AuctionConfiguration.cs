using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class AuctionConfiguration : IEntityTypeConfiguration<Auction>
{
    public void Configure(EntityTypeBuilder<Auction> builder)
    {
        builder.HasKey(a => a.Id);

        // Zaman bilgileri
        builder.Property(a => a.StartTime)
            .IsRequired();

        builder.Property(a => a.EndTime)
            .IsRequired();

        builder.Property(a => a.CountdownDuration)
            .IsRequired()
            .HasDefaultValue(0);

        // Fiyat bilgileri
        builder.Property(a => a.StartingPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(a => a.CurrentPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(a => a.MaxPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)")
            .HasDefaultValue(0);

        // Ürün bilgileri
        builder.Property(a => a.ProductQuantity)
            .IsRequired()
            .HasDefaultValue(1);

        // Durum bilgileri
        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Relationships
        builder.HasOne(a => a.Product)
            .WithMany()
            .HasForeignKey(a => a.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Bids)
            .WithOne(b => b.Auction)
            .HasForeignKey(b => b.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
