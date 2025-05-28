using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Features.Orders.Queries.GetOrderById;

public class GetOrderByIdQuery : IRequest<OrderDto>
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; } // Kullanıcı kendi siparişlerini görebilir
}
