using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class AuctionBidConfiguration : IEntityTypeConfiguration<AuctionBid>
{
    public void Configure(EntityTypeBuilder<AuctionBid> builder)
    {
        builder.HasKey(b => b.Id);
        
        builder.Property(b => b.BidAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");
            
        builder.Property(b => b.BidTime)
            .IsRequired();
            
        // Relationships
        builder.HasOne(b => b.Auction)
            .WithMany(a => a.Bids)
            .HasForeignKey(b => b.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
