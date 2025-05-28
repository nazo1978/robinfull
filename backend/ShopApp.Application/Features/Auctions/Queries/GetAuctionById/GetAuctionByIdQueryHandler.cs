using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using ShopApp.Application.Features.Auctions.Rules;
using ShopApp.Application.Services.Repositories;

namespace ShopApp.Application.Features.Auctions.Queries.GetAuctionById;

public class GetAuctionByIdQueryHandler : IRequestHandler<GetAuctionByIdQuery, GetAuctionByIdResponse>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IMapper _mapper;
    private readonly AuctionBusinessRules _auctionBusinessRules;

    public GetAuctionByIdQueryHandler(
        IAuctionRepository auctionRepository,
        IMapper mapper,
        AuctionBusinessRules auctionBusinessRules)
    {
        _auctionRepository = auctionRepository;
        _mapper = mapper;
        _auctionBusinessRules = auctionBusinessRules;
    }

    public async Task<GetAuctionByIdResponse> Handle(GetAuctionByIdQuery request, CancellationToken cancellationToken)
    {
        var auction = await _auctionRepository.GetAuctionWithBidsAndProductAsync(request.Id, cancellationToken);
        await _auctionBusinessRules.AuctionShouldExistAsync(auction);

        var response = _mapper.Map<GetAuctionByIdResponse>(auction);

        // Ürün bilgileri
        response.ProductName = auction.Product.Name;
        response.ProductDescription = auction.Product.Description;

        // Kalan süreyi hesapla
        var now = DateTime.Now;
        if (now < auction.EndTime)
        {
            var remainingTime = auction.EndTime - now;
            response.RemainingMinutes = (int)remainingTime.TotalMinutes;
        }
        else
        {
            response.RemainingMinutes = 0;
        }

        // Kazanan bilgisi
        if (auction.CurrentWinnerId.HasValue)
        {
            response.CurrentWinnerName = "User " + auction.CurrentWinnerId.Value.ToString().Substring(0, 8);
        }

        // Map bids
        response.Bids = auction.Bids
            .OrderByDescending(b => b.BidTime)
            .Select(b => new AuctionBidDto
            {
                Id = b.Id,
                BidderId = b.BidderId,
                BidderName = "User " + b.BidderId.ToString().Substring(0, 8), // Placeholder for actual user name
                BidAmount = b.BidAmount,
                BidTime = b.BidTime
            })
            .ToList();

        return response;
    }
}
