using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Core.Identity;
using ShopApp.Domain.Entities;

namespace ShopApp.Persistence.Contexts;

public class ShopAppDbContext : DbContext, IApplicationDbContext
{
    public ShopAppDbContext(DbContextOptions<ShopAppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    // Discount DbSet'leri
    public DbSet<Discount> Discounts => Set<Discount>();
    public DbSet<DiscountRule> DiscountRules => Set<DiscountRule>();

    // Auction DbSet'leri
    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<AuctionBid> AuctionBids => Set<AuctionBid>();

    // User DbSet'leri
    public DbSet<User> Users => Set<User>();
    public DbSet<ApplicationUser> ApplicationUsers => Set<ApplicationUser>();

    // Müşteri DbSet'leri
    public DbSet<BireyselMusteri> BireyselMusteriler => Set<BireyselMusteri>();
    public DbSet<KurumsalMusteri> KurumsalMusteriler => Set<KurumsalMusteri>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Entity Configuration'ları burada uygulanır
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // User ve ApplicationUser için farklı tablolar
        modelBuilder.Entity<User>().ToTable("Users");
        modelBuilder.Entity<ApplicationUser>().ToTable("ApplicationUsers");

        base.OnModelCreating(modelBuilder);
    }
}