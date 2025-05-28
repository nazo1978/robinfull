using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using ShopApp.Application.Features.Auctions.Rules;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Auctions.Commands.PlaceBid;

public class PlaceBidCommandHandler : IRequestHandler<PlaceBidCommand, PlaceBidResponse>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IMapper _mapper;
    private readonly AuctionBusinessRules _auctionBusinessRules;

    public PlaceBidCommandHandler(
        IAuctionRepository auctionRepository,
        IMapper mapper,
        AuctionBusinessRules auctionBusinessRules)
    {
        _auctionRepository = auctionRepository;
        _mapper = mapper;
        _auctionBusinessRules = auctionBusinessRules;
    }

    public async Task<PlaceBidResponse> Handle(PlaceBidCommand request, CancellationToken cancellationToken)
    {
        // Get auction with bids
        var auction = await _auctionRepository.GetAuctionWithBidsAsync(request.AuctionId, cancellationToken);
        await _auctionBusinessRules.AuctionShouldExistAsync(auction);
        await _auctionBusinessRules.AuctionShouldBeActiveAsync(request.AuctionId);

        // Validate bid amount
        _auctionBusinessRules.BidAmountShouldBeHigherThanCurrentPrice(request.BidAmount, auction.CurrentPrice);

        // Maksimum fiyat kontrolü
        if (auction.MaxPrice > 0 && request.BidAmount > auction.MaxPrice)
        {
            throw new Exception($"Teklif, maksimum fiyat limitini ({auction.MaxPrice:C}) aşamaz.");
        }

        // Create bid
        var bid = new AuctionBid
        {
            AuctionId = request.AuctionId,
            BidderId = request.BidderId,
            BidAmount = request.BidAmount,
            BidTime = DateTime.Now
        };

        // Update auction with new highest bid
        auction.CurrentPrice = request.BidAmount;
        auction.CurrentWinnerId = request.BidderId;
        auction.Bids.Add(bid);

        await _auctionRepository.UpdateAsync(auction, cancellationToken);

        // Not: SignalR entegrasyonu WebApi katmanında yapılacak
        // Burada sadece veritabanı işlemleri gerçekleştiriliyor

        // Map to response
        var response = _mapper.Map<PlaceBidResponse>(bid);
        response.IsHighestBid = true;

        return response;
    }
}
