using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Commands.AddToCart;

public class AddToCartCommand : IRequest<CartDto>
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
} 