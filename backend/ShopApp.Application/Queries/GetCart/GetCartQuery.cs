using System;
using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Queries.GetCart;

public class GetCartQuery : IRequest<CartDto>
{
    public Guid UserId { get; set; }

    public GetCartQuery(Guid userId)
    {
        UserId = userId;
    }
}