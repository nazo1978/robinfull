using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Features.Auctions.Rules;
using ShopApp.Application.Services.Repositories;

namespace ShopApp.Application.Features.Auctions.Commands.UpdateAuction;

public class UpdateAuctionCommandHandler : IRequestHandler<UpdateAuctionCommand, UpdateAuctionResponse>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IMapper _mapper;
    private readonly AuctionBusinessRules _auctionBusinessRules;

    public UpdateAuctionCommandHandler(
        IAuctionRepository auctionRepository,
        IMapper mapper,
        AuctionBusinessRules auctionBusinessRules)
    {
        _auctionRepository = auctionRepository;
        _mapper = mapper;
        _auctionBusinessRules = auctionBusinessRules;
    }

    public async Task<UpdateAuctionResponse> Handle(UpdateAuctionCommand request, CancellationToken cancellationToken)
    {
        // Get auction with product
        var auction = await _auctionRepository.GetAuctionWithProductAsync(request.Id, cancellationToken);
        await _auctionBusinessRules.AuctionShouldExistAsync(auction);

        // Validate auction rules
        _auctionBusinessRules.AuctionEndTimeShouldBeAfterStartTime(request.StartTime, request.EndTime);

        // Update auction
        auction.StartTime = request.StartTime;
        auction.EndTime = request.EndTime;
        auction.StartingPrice = request.StartingPrice;
        auction.IsActive = request.IsActive;

        // If starting price is changed and higher than current price, update current price
        if (request.StartingPrice > auction.CurrentPrice)
        {
            auction.CurrentPrice = request.StartingPrice;
            auction.CurrentWinnerId = null;
        }

        await _auctionRepository.UpdateAsync(auction, cancellationToken);

        // Map to response
        var response = _mapper.Map<UpdateAuctionResponse>(auction);
        response.ProductName = auction.Product.Name;

        return response;
    }
}
