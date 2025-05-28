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

namespace ShopApp.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IApplicationDbContext _context;

    public CreateOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Sipariş numarası oluştur
        var orderNumber = await GenerateOrderNumberAsync(cancellationToken);

        // Ürünleri kontrol et
        var productIds = request.OrderItems.Select(x => x.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p, cancellationToken);

        if (products.Count != productIds.Count)
        {
            throw new BusinessException("Bazı ürünler bulunamadı.");
        }

        // Stok kontrolü
        foreach (var orderItem in request.OrderItems)
        {
            var product = products[orderItem.ProductId];
            if (product.StockQuantity < orderItem.Quantity)
            {
                throw new BusinessException($"'{product.Name}' ürünü için yeterli stok bulunmamaktadır. Mevcut stok: {product.StockQuantity}");
            }
        }

        // Order entity'si oluştur
        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = request.UserId,
            Status = OrderStatus.Pending,
            ItemsPrice = request.ItemsPrice,
            TaxPrice = request.TaxPrice,
            ShippingPrice = request.ShippingPrice,
            TotalPrice = request.TotalPrice,
            ShippingName = request.Shipping.Name,
            ShippingAddress = request.Shipping.Address,
            ShippingCity = request.Shipping.City,
            ShippingPostalCode = request.Shipping.PostalCode,
            ShippingCountry = request.Shipping.Country,
            ShippingPhone = request.Shipping.Phone,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            Notes = request.Notes
        };

        // OrderItem'ları oluştur
        foreach (var orderItemDto in request.OrderItems)
        {
            var product = products[orderItemDto.ProductId];
            var originalTotalPrice = orderItemDto.UnitPrice * orderItemDto.Quantity;
            var totalPrice = originalTotalPrice - orderItemDto.DiscountAmount;

            var orderItem = new OrderItem
            {
                ProductId = orderItemDto.ProductId,
                ProductName = product.Name,
                ProductDescription = product.Description,
                Quantity = orderItemDto.Quantity,
                UnitPrice = orderItemDto.UnitPrice,
                DiscountRate = orderItemDto.DiscountRate,
                DiscountAmount = orderItemDto.DiscountAmount,
                OriginalTotalPrice = originalTotalPrice,
                TotalPrice = totalPrice
            };

            order.OrderItems.Add(orderItem);

            // Stok güncelle
            product.StockQuantity -= orderItemDto.Quantity;
        }

        // Veritabanına kaydet
        await _context.Orders.AddAsync(order, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür ve döndür
        return MapToDto(order);
    }

    private async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.Now;
        var prefix = $"ORD{today:yyyyMMdd}";

        var lastOrder = await _context.Orders
            .Where(o => o.OrderNumber.StartsWith(prefix))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastOrder != null)
        {
            var lastSequence = lastOrder.OrderNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out var lastSeq))
            {
                sequence = lastSeq + 1;
            }
        }

        return $"{prefix}{sequence:D4}";
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
