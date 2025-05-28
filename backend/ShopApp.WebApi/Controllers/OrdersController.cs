using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Features.Orders.Commands.CreateOrder;
using ShopApp.Application.Features.Orders.Commands.UpdateOrderStatus;
using ShopApp.Application.Features.Orders.Queries.GetOrderById;
using ShopApp.Application.Features.Orders.Queries.GetOrders;
using ShopApp.Domain.Entities;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Yeni sipariş oluşturur
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand request)
    {
        // Kullanıcı ID'sini token'dan al
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Geçersiz kullanıcı token'ı.");
        }

        request.UserId = userId;
        var result = await _mediator.Send(request);
        return Ok(result);
    }

    /// <summary>
    /// Siparişleri listeler (kullanıcı kendi siparişlerini, admin tümünü görebilir)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] GetOrdersQuery query)
    {
        // Kullanıcı rolünü kontrol et
        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin)
        {
            // Normal kullanıcı sadece kendi siparişlerini görebilir
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Geçersiz kullanıcı token'ı.");
            }
            query.UserId = userId;
        }

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Belirli bir siparişi getirir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var query = new GetOrderByIdQuery { Id = id };

        // Admin değilse sadece kendi siparişini görebilir
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Geçersiz kullanıcı token'ı.");
            }
            query.UserId = userId;
        }

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Sipariş durumunu günceller (sadece admin)
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var command = new UpdateOrderStatusCommand
        {
            Id = id,
            Status = request.Status,
            PaymentStatus = request.PaymentStatus,
            Notes = request.Notes
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Kullanıcının sipariş geçmişini getirir
    /// </summary>
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Geçersiz kullanıcı token'ı.");
        }

        var query = new GetOrdersQuery
        {
            UserId = userId,
            Page = page,
            Size = size,
            SortBy = "CreatedAt",
            SortDescending = true
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Siparişi iptal eder (sadece Pending durumundaki siparişler)
    /// </summary>
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        // Kullanıcı sadece kendi siparişini iptal edebilir
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Geçersiz kullanıcı token'ı.");
        }

        // Önce siparişin kullanıcıya ait olup olmadığını kontrol et
        var getOrderQuery = new GetOrderByIdQuery { Id = id, UserId = userId };
        var order = await _mediator.Send(getOrderQuery);

        if (order.Status != OrderStatus.Pending)
        {
            return BadRequest("Sadece beklemede olan siparişler iptal edilebilir.");
        }

        var command = new UpdateOrderStatusCommand
        {
            Id = id,
            Status = OrderStatus.Cancelled,
            Notes = "Kullanıcı tarafından iptal edildi."
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
    public string? Notes { get; set; }
}
