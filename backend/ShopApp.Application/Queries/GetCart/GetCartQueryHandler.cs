using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;

namespace ShopApp.Application.Queries.GetCart;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly IApplicationDbContext _context;

    public GetCartQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .Include(c => c.Items)
            .ThenInclude(i => i.AppliedDiscount)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

        if (cart == null)
        {
            return null;
        }

        var cartDto = new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            OriginalTotalPrice = cart.OriginalTotalPrice,
            TotalDiscountAmount = cart.TotalDiscountAmount,
            TotalPrice = cart.TotalPrice,
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                CartId = i.CartId,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                DiscountRate = i.DiscountRate,
                DiscountAmount = i.DiscountAmount,
                OriginalTotalPrice = i.OriginalTotalPrice,
                TotalPrice = i.TotalPrice,
                AppliedDiscountId = i.AppliedDiscountId,
                AppliedDiscountName = i.AppliedDiscount?.Name
            }).ToList()
        };

        return cartDto;
    }
}