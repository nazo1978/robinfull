using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Features.Auctions.Rules;
using ShopApp.Application.Interfaces;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Auctions.Commands.CreateAuction;

public class CreateAuctionCommandHandler : IRequestHandler<CreateAuctionCommand, CreateAuctionResponse>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly AuctionBusinessRules _auctionBusinessRules;

    public CreateAuctionCommandHandler(
        IAuctionRepository auctionRepository,
        IApplicationDbContext dbContext,
        IMapper mapper,
        AuctionBusinessRules auctionBusinessRules)
    {
        _auctionRepository = auctionRepository;
        _dbContext = dbContext;
        _mapper = mapper;
        _auctionBusinessRules = auctionBusinessRules;
    }

    public async Task<CreateAuctionResponse> Handle(CreateAuctionCommand request, CancellationToken cancellationToken)
    {
        // Validate product exists
        var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product == null)
            throw new Exception($"Product with ID {request.ProductId} not found");

        // Validate auction rules
        _auctionBusinessRules.AuctionEndTimeShouldBeAfterStartTime(request.StartTime, request.EndTime);
        _auctionBusinessRules.AuctionStartTimeShouldBeInFuture(request.StartTime);

        // Create auction
        var auction = new Auction
        {
            ProductId = request.ProductId,

            // Zaman bilgileri
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            CountdownDuration = request.CountdownDuration,

            // Fiyat bilgileri
            StartingPrice = request.StartingPrice,
            CurrentPrice = request.StartingPrice,
            MaxPrice = request.MaxPrice,

            // Ürün bilgileri
            ProductQuantity = request.ProductQuantity,

            // Durum bilgileri
            IsActive = true
        };

        await _auctionRepository.AddAsync(auction, cancellationToken);

        // Map to response
        var response = _mapper.Map<CreateAuctionResponse>(auction);
        response.ProductName = product.Name;

        return response;
    }
}
