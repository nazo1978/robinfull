using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public class KurumsalMusteriConfiguration : MusteriConfiguration<KurumsalMusteri>
{
    public override void Configure(EntityTypeBuilder<KurumsalMusteri> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("KurumsalMusteriler");
        
        builder.Property(m => m.FirmaAdi)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(m => m.VergiDairesi)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(m => m.VergiNo)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.HasIndex(m => m.VergiNo)
            .IsUnique();
            
        builder.Property(m => m.FaaliyetAlani)
            .HasMaxLength(255);
            
        builder.Property(m => m.YetkiliKisiAdi)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(m => m.YetkiliKisiSoyadi)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(m => m.YetkiliKisiTelefonu)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(m => m.YetkiliKisiEmail)
            .IsRequired()
            .HasMaxLength(255);
    }
} 