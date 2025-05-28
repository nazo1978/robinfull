using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Auctions.Queries.GetAuctions;

public class GetAuctionsQueryHandler : IRequestHandler<GetAuctionsQuery, PaginatedResult<GetAuctionsResponse>>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public GetAuctionsQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<PaginatedResult<GetAuctionsResponse>> Handle(GetAuctionsQuery request, CancellationToken cancellationToken)
    {
        var query = _dbContext.Auctions
            .Include(a => a.Product)
            .Include(a => a.Bids)
            .AsQueryable();

        // Filter by active status if requested
        if (request.OnlyActive)
        {
            query = query.Where(a => a.IsActive && a.EndTime > DateTime.Now);
        }

        // Order by end time (soonest ending first)
        query = query.OrderBy(a => a.EndTime);

        // Create paged result
        var totalCount = await query.CountAsync(cancellationToken);
        var auctions = await query
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Map to response objects
        var now = DateTime.Now;
        var items = auctions.Select(a =>
        {
            var remainingTime = a.EndTime > now ? a.EndTime - now : TimeSpan.Zero;

            return new GetAuctionsResponse
            {
                Id = a.Id,
                ProductId = a.ProductId,
                ProductName = a.Product.Name,
                ProductDescription = a.Product.Description,

                // Zaman bilgileri
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                CountdownDuration = a.CountdownDuration,
                RemainingMinutes = (int)remainingTime.TotalMinutes,

                // Fiyat bilgileri
                StartingPrice = a.StartingPrice,
                CurrentPrice = a.CurrentPrice,
                MaxPrice = a.MaxPrice,

                // Ürün bilgileri
                ProductQuantity = a.ProductQuantity,

                // Teklif bilgileri
                BidCount = a.Bids.Count,

                // Durum bilgileri
                IsActive = a.IsActive && a.EndTime > now
            };
        }).ToList();

        return new PaginatedResult<GetAuctionsResponse>(
            items,
            totalCount,
            request.PageIndex,
            request.PageSize);
    }
}
