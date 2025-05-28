using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ShopApp.Application.Services.Repositories;
using ShopApp.Core.Identity;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;
using ShopApp.Persistence.Repositories;

namespace ShopApp.Persistence;

public static class ServiceRegistration
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<ShopAppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ShopAppDbContext).Assembly.FullName)));

        // DbContext Interface
        services.AddScoped<Application.Interfaces.IApplicationDbContext>(provider => provider.GetRequiredService<ShopAppDbContext>());

        // Generic Repositories
        services.AddScoped(typeof(IAsyncRepository<>), typeof(AsyncRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // User Repositories
        services.AddScoped<Application.Interfaces.IUserRepository, UserRepository>();
        services.AddScoped<Application.Interfaces.IApplicationUserRepository, ApplicationUserRepository>();

        // Müşteri Repositories
        services.AddScoped(typeof(Application.Interfaces.IMusteriRepository<>), typeof(MusteriRepository<>));
        services.AddScoped<Application.Interfaces.IBireyselMusteriRepository, BireyselMusteriRepository>();
        services.AddScoped<Application.Interfaces.IKurumsalMusteriRepository, KurumsalMusteriRepository>();

        // Auction Repository
        services.AddScoped<IAuctionRepository, AuctionRepository>();

        // Discount Repository
        services.AddScoped<IDiscountRepository, DiscountRepository>();

        // Product Repository
        services.AddScoped<IProductRepository, ProductRepository>();

        return services;
    }
}
