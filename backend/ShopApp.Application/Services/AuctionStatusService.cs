using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Services;

public class AuctionStatusService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuctionStatusService> _logger;

    public AuctionStatusService(IServiceProvider serviceProvider, ILogger<AuctionStatusService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

                await UpdateAuctionStatuses(context);
                
                // Her 30 saniyede bir kontrol et
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Açık artırma durumları güncellenirken hata oluştu");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }

    private async Task UpdateAuctionStatuses(IApplicationDbContext context)
    {
        var now = DateTime.UtcNow;
        
        // Pending -> Active
        var pendingAuctions = await context.Auctions
            .Where(a => a.Status == AuctionStatus.Pending && a.StartTime <= now)
            .ToListAsync();

        foreach (var auction in pendingAuctions)
        {
            auction.Status = AuctionStatus.Active;
            _logger.LogInformation($"Açık artırma {auction.Id} aktif duruma geçirildi");
        }

        // Active -> Ended
        var activeAuctions = await context.Auctions
            .Where(a => a.Status == AuctionStatus.Active && a.EndTime <= now)
            .ToListAsync();

        foreach (var auction in activeAuctions)
        {
            auction.Status = AuctionStatus.Ended;
            _logger.LogInformation($"Açık artırma {auction.Id} sona erdirildi");
        }

        if (pendingAuctions.Any() || activeAuctions.Any())
        {
            await context.SaveChangesAsync();
            _logger.LogInformation($"{pendingAuctions.Count} açık artırma aktif, {activeAuctions.Count} açık artırma sona erdirildi");
        }
    }
}
