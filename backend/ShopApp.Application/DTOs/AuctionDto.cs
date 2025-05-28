using System;
using System.Collections.Generic;

namespace ShopApp.Application.DTOs;

public class AuctionDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public ProductDto Product { get; set; } = null!;

    public decimal StartPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MinIncrement { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public string Status { get; set; } = string.Empty;

    public Guid? HighestBidderId { get; set; }
    public UserDto? HighestBidder { get; set; }

    public string? Description { get; set; }

    public List<BidDto> Bids { get; set; } = new();

    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
}

public class BidDto
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public Guid UserId { get; set; }
    public UserDto User { get; set; } = null!;

    public decimal Amount { get; set; }
    public DateTime BidTime { get; set; }
    public bool IsWinning { get; set; }
    public string? Notes { get; set; }
}

public class CreateAuctionDto
{
    public Guid ProductId { get; set; }
    public decimal StartPrice { get; set; }
    public decimal MinIncrement { get; set; } = 1;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Description { get; set; }
}

public class CreateBidDto
{
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}


