using MediatR;
using ShopApp.Application.DTOs;
using System.Collections.Generic;

namespace ShopApp.Application.Queries.GetAuctions;

public class GetAuctionsQuery : IRequest<List<AuctionDto>>
{
    public string? Status { get; set; }
    public string? Category { get; set; }
    public string? SortBy { get; set; } = "endingSoon";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
