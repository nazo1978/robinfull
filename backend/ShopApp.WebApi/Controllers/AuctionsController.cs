using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Features.Auctions.Commands.CreateAuction;
using ShopApp.Application.Features.Auctions.Commands.PlaceBid;
using ShopApp.Application.Features.Auctions.Commands.UpdateAuction;
using ShopApp.Application.Features.Auctions.Commands.DeleteAuction;
using ShopApp.Application.Features.Auctions.Queries.GetAuctionById;
using ShopApp.Application.Features.Auctions.Queries.GetAuctions;
using ShopApp.Core.Pagination;
using ShopApp.Core.Security.Roles;
using Microsoft.AspNetCore.Authorization;

namespace ShopApp.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuctionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<PaginatedResult<GetAuctionsResponse>>> GetAll([FromQuery] GetAuctionsQuery query)
        {
            return await _mediator.Send(query);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GetAuctionByIdResponse>> GetById(Guid id)
        {
            var response = await _mediator.Send(new GetAuctionByIdQuery { Id = id });
            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = Role.Admin)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CreateAuctionResponse>> Create(CreateAuctionCommand command)
        {
            var response = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = Role.Admin)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UpdateAuctionResponse>> Update(Guid id, UpdateAuctionCommand command)
        {
            if (id != command.Id)
                return BadRequest();
                
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Role.Admin)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DeleteAuctionResponse>> Delete(Guid id)
        {
            var response = await _mediator.Send(new DeleteAuctionCommand { Id = id });
            return Ok(response);
        }

        [HttpPost("bid")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlaceBidResponse>> PlaceBid(PlaceBidCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }
    }
}