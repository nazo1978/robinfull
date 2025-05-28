using System;
using System.Collections.Generic;
using MediatR;
using ShopApp.Application.DTOs;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommand : IRequest<OrderDto>
{
    public Guid UserId { get; set; }
    
    // Sipariş öğeleri
    public List<CreateOrderItemDto> OrderItems { get; set; } = new();
    
    // Teslimat bilgileri
    public CreateShippingInfoDto Shipping { get; set; } = new();
    
    // Ödeme bilgileri
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CreditCard;
    
    // Fiyat bilgileri
    public decimal ItemsPrice { get; set; }
    public decimal TaxPrice { get; set; } = 0;
    public decimal ShippingPrice { get; set; } = 0;
    public decimal TotalPrice { get; set; }
    
    // Notlar
    public string? Notes { get; set; }
}

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountRate { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
}

public class CreateShippingInfoDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = "Türkiye";
    public string Phone { get; set; } = string.Empty;
}
