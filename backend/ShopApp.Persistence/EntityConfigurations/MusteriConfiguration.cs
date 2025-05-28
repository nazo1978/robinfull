using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopApp.Core.Identity;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.EntityConfigurations;

public abstract class MusteriConfiguration<T> : IEntityTypeConfiguration<T> where T : Musteri
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        // Key is defined in User configuration

        builder.Property(m => m.Ad)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Soyad)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(m => m.Telefon)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(m => m.Adres)
            .HasMaxLength(500);

        builder.Property(m => m.KayitTarihi)
            .IsRequired();

        builder.Property(m => m.AktifMi)
            .IsRequired()
            .HasDefaultValue(true);
    }
}