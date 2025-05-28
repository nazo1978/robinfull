using System;
using System.Collections.Generic;

namespace ShopApp.Core.Pagination;

public class PaginatedResult<T>
{
    public List<T> Items { get; }
    public int TotalCount { get; }
    public int PageIndex { get; }
    public int PageSize { get; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageIndex > 0;
    public bool HasNextPage => PageIndex < TotalPages - 1;

    public PaginatedResult(List<T> items, int totalCount, int pageIndex, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageIndex = pageIndex;
        PageSize = pageSize;
    }

    public static PaginatedResult<T> Create(List<T> items, int totalCount, int pageIndex, int pageSize)
    {
        return new PaginatedResult<T>(items, totalCount, pageIndex, pageSize);
    }
}
