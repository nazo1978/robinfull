using System;
using System.Threading.Tasks;
using ShopApp.Application.Services.Repositories;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Auctions.Rules;

public class AuctionBusinessRules
{
    private readonly IAuctionRepository _auctionRepository;

    public AuctionBusinessRules(IAuctionRepository auctionRepository)
    {
        _auctionRepository = auctionRepository;
    }

    public async Task AuctionShouldExistAsync(Auction? auction)
    {
        if (auction == null)
            throw new NotFoundException("Auction not found");
    }

    public async Task AuctionShouldBeActiveAsync(Guid auctionId)
    {
        bool isActive = await _auctionRepository.IsAuctionActiveAsync(auctionId);
        if (!isActive)
            throw new BusinessException("Auction is not active");
    }

    public void AuctionEndTimeShouldBeAfterStartTime(DateTime startTime, DateTime endTime)
    {
        if (endTime <= startTime)
            throw new BusinessException("End time must be after start time");
    }

    public void AuctionStartTimeShouldBeInFuture(DateTime startTime)
    {
        if (startTime < DateTime.Now)
            throw new BusinessException("Start time must be in the future");
    }

    public void BidAmountShouldBeHigherThanCurrentPrice(decimal bidAmount, decimal currentPrice)
    {
        if (bidAmount <= currentPrice)
            throw new BusinessException("Bid amount must be higher than current price");
    }
}
