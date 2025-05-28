using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class BireyselMusteriConfiguration : MusteriConfiguration<BireyselMusteri>
{
    public override void Configure(EntityTypeBuilder<BireyselMusteri> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("BireyselMusteriler");
        
        builder.Property(m => m.TCKN)
            .IsRequired()
            .HasMaxLength(11);
        
        builder.HasIndex(m => m.TCKN)
            .IsUnique();
            
        builder.Property(m => m.DogumTarihi)
            .IsRequired();
            
        builder.Property(m => m.Cinsiyet)
            .HasMaxLength(10);
            
        builder.Property(m => m.MedeniDurum)
            .HasMaxLength(20);
            
        builder.Property(m => m.MeslekBilgisi)
            .HasMaxLength(100);
    }
} 