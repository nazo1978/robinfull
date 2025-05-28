using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Commands.CreateAuction;
using ShopApp.Application.Commands.CreateBid;
using ShopApp.Application.Commands.DeleteAuction;
using ShopApp.Application.Commands.UpdateAuction;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Application.Queries.GetAuctionById;
using ShopApp.Application.Queries.GetAuctions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController : BaseController
{
    private readonly IMediator _mediator;
    private readonly IApplicationDbContext _context;

    public AuctionsController(IMediator mediator, IApplicationDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> GetAuctions([FromQuery] GetAuctionsQuery query)
    {
        try
        {
            var auctions = await _mediator.Send(query);
            return Ok(new { success = true, auctions });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> GetAuction(Guid id)
    {
        try
        {
            var auction = await _mediator.Send(new GetAuctionByIdQuery(id));
            if (auction == null)
            {
                return NotFound(new { message = "Açık artırma bulunamadı", success = false });
            }

            return Ok(new { success = true, auction });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<object>> CreateAuction([FromBody] CreateAuctionCommand command)
    {
        try
        {
            // Admin kontrolü
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var auction = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAuction), new { id = auction.Id }, new { success = true, auction });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> UpdateAuction(Guid id, [FromBody] UpdateAuctionCommand command)
    {
        try
        {
            // Admin kontrolü
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            command.Id = id; // URL'den gelen ID'yi command'e ata
            var auction = await _mediator.Send(command);
            return Ok(new { success = true, auction });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<object>> DeleteAuction(Guid id)
    {
        try
        {
            // Admin kontrolü
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var result = await _mediator.Send(new DeleteAuctionCommand(id));
            return Ok(new { success = true, message = "Açık artırma başarıyla silindi" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPost("update-statuses")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<object>> UpdateAuctionStatuses()
    {
        try
        {
            // Admin kontrolü
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var now = DateTime.UtcNow;
            var updatedCount = 0;

            // Pending -> Active
            var pendingAuctions = await _context.Auctions
                .Where(a => a.Status == Domain.Entities.AuctionStatus.Pending && a.StartTime <= now)
                .ToListAsync();

            foreach (var auction in pendingAuctions)
            {
                auction.Status = Domain.Entities.AuctionStatus.Active;
                updatedCount++;
            }

            // Active -> Ended
            var activeAuctions = await _context.Auctions
                .Where(a => a.Status == Domain.Entities.AuctionStatus.Active && a.EndTime <= now)
                .ToListAsync();

            foreach (var auction in activeAuctions)
            {
                auction.Status = Domain.Entities.AuctionStatus.Ended;
                updatedCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new {
                success = true,
                message = $"{updatedCount} açık artırma durumu güncellendi",
                pendingToActive = pendingAuctions.Count,
                activeToEnded = activeAuctions.Count
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPost("{id}/bid")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<object>> CreateBid(Guid id, [FromBody] CreateBidDto bidDto)
    {
        try
        {
            var userIdString = GetCurrentUserId();
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized(new { message = "Kullanıcı kimliği doğrulanamadı", success = false });
            }

            var command = new CreateBidCommand
            {
                AuctionId = id,
                UserId = userId,
                Amount = bidDto.Amount,
                Notes = bidDto.Notes
            };

            var bid = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAuction), new { id }, new { success = true, bid });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }
}