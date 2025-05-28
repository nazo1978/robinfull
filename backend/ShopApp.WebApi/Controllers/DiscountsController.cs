using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Features.Discounts.Commands.CreateDiscount;
using ShopApp.Application.Features.Discounts.Queries.GetDiscounts;
using ShopApp.Core.Pagination;
using ShopApp.Core.Security.Roles;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DiscountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<GetDiscountsResponse>>> GetAll([FromQuery] GetDiscountsQuery query)
    {
        return await _mediator.Send(query);
    }

    [HttpPost]
    [Authorize(Roles = Role.Admin)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateDiscountResponse>> Create(CreateDiscountCommand command)
    {
        var response = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { }, response);
    }
}
