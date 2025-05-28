using System;
using MediatR;
using ShopApp.Application.DTOs;
using ShopApp.Core.Pagination;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersQuery : IRequest<PaginatedResult<OrderDto>>
{
    public Guid? UserId { get; set; } // Belirli bir kullanıcının siparişleri için
    public OrderStatus? Status { get; set; } // Belirli bir duruma göre filtreleme
    public DateTime? StartDate { get; set; } // Başlangıç tarihi
    public DateTime? EndDate { get; set; } // Bitiş tarihi
    public string? OrderNumber { get; set; } // Sipariş numarasına göre arama
    
    // Pagination
    public int Page { get; set; } = 1;
    public int Size { get; set; } = 10;
    
    // Sorting
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}
