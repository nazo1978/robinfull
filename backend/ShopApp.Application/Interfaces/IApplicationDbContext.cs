using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Core.Identity;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Category> Categories { get; }
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }

    // Discount DbSet'leri
    DbSet<Discount> Discounts { get; }
    DbSet<DiscountRule> DiscountRules { get; }

    // Auction DbSet'leri
    DbSet<Auction> Auctions { get; }
    DbSet<AuctionBid> AuctionBids { get; }

    // User DbSet'leri
    DbSet<User> Users { get; }

    // Müşteri DbSet'leri
    DbSet<BireyselMusteri> BireyselMusteriler { get; }
    DbSet<KurumsalMusteri> KurumsalMusteriler { get; }

    // Order DbSet'leri
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}