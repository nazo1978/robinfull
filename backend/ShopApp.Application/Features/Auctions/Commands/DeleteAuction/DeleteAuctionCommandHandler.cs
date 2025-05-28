using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using ShopApp.Application.Features.Auctions.Rules;
using ShopApp.Application.Services.Repositories;

namespace ShopApp.Application.Features.Auctions.Commands.DeleteAuction;

public class DeleteAuctionCommandHandler : IRequestHandler<DeleteAuctionCommand, DeleteAuctionResponse>
{
    private readonly IAuctionRepository _auctionRepository;
    private readonly IMapper _mapper;
    private readonly AuctionBusinessRules _auctionBusinessRules;

    public DeleteAuctionCommandHandler(
        IAuctionRepository auctionRepository,
        IMapper mapper,
        AuctionBusinessRules auctionBusinessRules)
    {
        _auctionRepository = auctionRepository;
        _mapper = mapper;
        _auctionBusinessRules = auctionBusinessRules;
    }

    public async Task<DeleteAuctionResponse> Handle(DeleteAuctionCommand request, CancellationToken cancellationToken)
    {
        var auction = await _auctionRepository.GetByIdAsync(request.Id, cancellationToken);
        await _auctionBusinessRules.AuctionShouldExistAsync(auction);

        await _auctionRepository.DeleteAsync(auction, cancellationToken);

        return new DeleteAuctionResponse { Id = request.Id };
    }
}
