using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Commands.AddToCart;
using ShopApp.Application.DTOs;
using ShopApp.Application.Queries.GetCart;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CartsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CartDto>> GetCart(Guid userId)
    {
        var cart = await _mediator.Send(new GetCartQuery(userId));
        
        if (cart == null)
        {
            return NotFound();
        }
        
        return cart;
    }

    [HttpPost("add-item")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CartDto>> AddToCart(AddToCartCommand command)
    {
        var cart = await _mediator.Send(command);
        return Ok(cart);
    }
}