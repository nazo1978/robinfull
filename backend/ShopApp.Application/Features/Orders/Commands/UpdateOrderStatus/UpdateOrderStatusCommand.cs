using System;
using MediatR;
using ShopApp.Application.DTOs;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommand : IRequest<OrderDto>
{
    public Guid Id { get; set; }
    public OrderStatus Status { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
    public string? Notes { get; set; }
}
