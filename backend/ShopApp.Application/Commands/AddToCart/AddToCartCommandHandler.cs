using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Application.Services.Discounts;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Commands.AddToCart;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IDiscountService _discountService;

    public AddToCartCommandHandler(
        IApplicationDbContext context,
        IDiscountService discountService)
    {
        _context = context;
        _discountService = discountService;
    }

    public async Task<CartDto> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        // Ürünü bul
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
        {
            throw new Exception($"Ürün bulunamadı: {request.ProductId}");
        }

        // Kullanıcının sepetini bul veya oluştur
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = request.UserId,
                OriginalTotalPrice = 0,
                TotalDiscountAmount = 0,
                TotalPrice = 0
            };

            await _context.Carts.AddAsync(cart, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Sepette ürün var mı kontrol et
        var cartItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (cartItem != null)
        {
            // Ürün sepette varsa, miktarı artır
            cartItem.Quantity += request.Quantity;

            // İndirimsiz toplam fiyatı hesapla
            cartItem.OriginalTotalPrice = cartItem.UnitPrice * cartItem.Quantity;

            // En iyi indirimi hesapla
            var (discountAmount, discountRate, discountId) = await _discountService.GetBestDiscountAsync(
                product.Id, cartItem.Quantity, product.Price, cancellationToken);

            // İndirim bilgilerini güncelle
            cartItem.DiscountRate = discountRate;
            cartItem.DiscountAmount = discountAmount;
            cartItem.TotalPrice = cartItem.OriginalTotalPrice - discountAmount;
            cartItem.AppliedDiscountId = discountId;

            // İndirim referansını güncelle
            if (discountId.HasValue)
            {
                var discount = await _context.Discounts.FindAsync(discountId.Value);
                cartItem.AppliedDiscount = discount;
            }
            else
            {
                cartItem.AppliedDiscount = null;
            }
        }
        else
        {
            // İndirimsiz toplam fiyatı hesapla
            var originalTotalPrice = product.Price * request.Quantity;

            // En iyi indirimi hesapla
            var (discountAmount, discountRate, discountId) = await _discountService.GetBestDiscountAsync(
                product.Id, request.Quantity, product.Price, cancellationToken);

            // Ürün sepette yoksa, yeni ekle
            cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Product = product,
                Quantity = request.Quantity,
                UnitPrice = product.Price,
                OriginalTotalPrice = originalTotalPrice,
                DiscountRate = discountRate,
                DiscountAmount = discountAmount,
                TotalPrice = originalTotalPrice - discountAmount,
                AppliedDiscountId = discountId
            };

            // İndirim referansını ekle
            if (discountId.HasValue)
            {
                var discount = await _context.Discounts.FindAsync(discountId.Value);
                cartItem.AppliedDiscount = discount;
            }

            cart.Items.Add(cartItem);
        }

        // Sepetin toplam fiyatlarını güncelle
        cart.OriginalTotalPrice = cart.Items.Sum(i => i.OriginalTotalPrice);
        cart.TotalDiscountAmount = cart.Items.Sum(i => i.DiscountAmount);
        cart.TotalPrice = cart.OriginalTotalPrice - cart.TotalDiscountAmount;

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ları oluştur ve dön
        return new CartDto
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
    }
}