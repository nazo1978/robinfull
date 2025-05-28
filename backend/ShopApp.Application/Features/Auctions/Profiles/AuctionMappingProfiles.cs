using AutoMapper;
using ShopApp.Application.Features.Auctions.Commands.CreateAuction;
using ShopApp.Application.Features.Auctions.Commands.PlaceBid;
using ShopApp.Application.Features.Auctions.Commands.UpdateAuction;
using ShopApp.Application.Features.Auctions.Queries.GetAuctionById;
using ShopApp.Application.Features.Auctions.Queries.GetAuctions;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Auctions.Profiles;

public class AuctionMappingProfiles : Profile
{
    public AuctionMappingProfiles()
    {
        // Command mappings
        CreateMap<Auction, CreateAuctionResponse>();
        CreateMap<Auction, UpdateAuctionResponse>();
        CreateMap<AuctionBid, PlaceBidResponse>();
        
        // Query mappings
        CreateMap<Auction, GetAuctionsResponse>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
            .ForMember(dest => dest.ProductDescription, opt => opt.MapFrom(src => src.Product.Description))
            .ForMember(dest => dest.BidCount, opt => opt.MapFrom(src => src.Bids.Count));
            
        CreateMap<Auction, GetAuctionByIdResponse>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
            .ForMember(dest => dest.ProductDescription, opt => opt.MapFrom(src => src.Product.Description));
            
        CreateMap<AuctionBid, AuctionBidDto>();
    }
}
