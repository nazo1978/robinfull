using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Core.CrossCuttingConcerns.Exceptions;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, OrderDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateOrderStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (order == null)
        {
            throw new NotFoundException("Sipariş bulunamadı.");
        }

        // Durum güncellemesi
        var oldStatus = order.Status;
        order.Status = request.Status;

        // Durum değişikliğine göre tarihleri güncelle
        if (request.Status == OrderStatus.Shipped && oldStatus != OrderStatus.Shipped)
        {
            order.ShippedDate = DateTime.UtcNow;
        }
        else if (request.Status == OrderStatus.Delivered && oldStatus != OrderStatus.Delivered)
        {
            order.DeliveredDate = DateTime.UtcNow;
            if (!order.ShippedDate.HasValue)
            {
                order.ShippedDate = DateTime.UtcNow;
            }
        }

        // Ödeme durumu güncellemesi
        if (request.PaymentStatus.HasValue)
        {
            order.PaymentStatus = request.PaymentStatus.Value;
            if (request.PaymentStatus.Value == PaymentStatus.Paid && !order.PaymentDate.HasValue)
            {
                order.PaymentDate = DateTime.UtcNow;
            }
        }

        // Notlar güncellemesi
        if (!string.IsNullOrEmpty(request.Notes))
        {
            order.Notes = string.IsNullOrEmpty(order.Notes)
                ? request.Notes
                : $"{order.Notes}\n{DateTime.UtcNow:yyyy-MM-dd HH:mm}: {request.Notes}";
        }

        // İptal durumunda stokları geri ekle
        if (request.Status == OrderStatus.Cancelled && oldStatus != OrderStatus.Cancelled)
        {
            await RestoreStockAsync(order, cancellationToken);
        }

        order.ModifiedDate = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(order);
    }

    private async Task RestoreStockAsync(Order order, CancellationToken cancellationToken)
    {
        var productIds = order.OrderItems.Select(oi => oi.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p, cancellationToken);

        foreach (var orderItem in order.OrderItems)
        {
            if (products.TryGetValue(orderItem.ProductId, out var product))
            {
                product.StockQuantity += orderItem.Quantity;
            }
        }
    }

    private static OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            Status = order.Status,
            StatusText = GetStatusText(order.Status),
            ItemsPrice = order.ItemsPrice,
            TaxPrice = order.TaxPrice,
            ShippingPrice = order.ShippingPrice,
            TotalPrice = order.TotalPrice,
            Shipping = new ShippingInfoDto
            {
                Name = order.ShippingName,
                Address = order.ShippingAddress,
                City = order.ShippingCity,
                PostalCode = order.ShippingPostalCode,
                Country = order.ShippingCountry,
                Phone = order.ShippingPhone
            },
            Payment = new PaymentInfoDto
            {
                Method = order.PaymentMethod,
                MethodText = GetPaymentMethodText(order.PaymentMethod),
                Status = order.PaymentStatus,
                StatusText = GetPaymentStatusText(order.PaymentStatus),
                PaymentDate = order.PaymentDate
            },
            CreatedAt = order.CreatedDate,
            ShippedDate = order.ShippedDate,
            DeliveredDate = order.DeliveredDate,
            Notes = order.Notes,
            OrderItems = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.ProductName,
                ProductDescription = oi.ProductDescription,
                ProductImage = oi.ProductImage,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                DiscountRate = oi.DiscountRate,
                DiscountAmount = oi.DiscountAmount,
                OriginalTotalPrice = oi.OriginalTotalPrice,
                TotalPrice = oi.TotalPrice
            }).ToList()
        };
    }

    private static string GetStatusText(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.Pending => "Beklemede",
            OrderStatus.Processing => "İşleniyor",
            OrderStatus.Shipped => "Kargoya Verildi",
            OrderStatus.Delivered => "Teslim Edildi",
            OrderStatus.Cancelled => "İptal Edildi",
            _ => "Bilinmiyor"
        };
    }

    private static string GetPaymentMethodText(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.CreditCard => "Kredi Kartı",
            PaymentMethod.DebitCard => "Banka Kartı",
            PaymentMethod.BankTransfer => "Havale/EFT",
            PaymentMethod.Cash => "Nakit",
            _ => "Bilinmiyor"
        };
    }

    private static string GetPaymentStatusText(PaymentStatus status)
    {
        return status switch
        {
            PaymentStatus.Pending => "Beklemede",
            PaymentStatus.Paid => "Ödendi",
            PaymentStatus.Failed => "Başarısız",
            PaymentStatus.Refunded => "İade Edildi",
            _ => "Bilinmiyor"
        };
    }
}
