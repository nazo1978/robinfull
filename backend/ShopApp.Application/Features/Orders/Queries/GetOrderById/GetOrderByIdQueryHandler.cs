using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Core.CrossCuttingConcerns.Exceptions;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Orders.Queries.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
            .AsQueryable();

        // Kullanıcı kendi siparişlerini görebilir veya admin tüm siparişleri görebilir
        if (request.UserId.HasValue)
        {
            query = query.Where(o => o.UserId == request.UserId.Value);
        }

        var order = await query
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

        if (order == null)
        {
            throw new NotFoundException("Sipariş bulunamadı.");
        }

        return MapToDto(order);
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
