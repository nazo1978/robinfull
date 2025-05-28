using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Queries.GetSiteSettings;

public class GetSiteSettingsQueryHandler : IRequestHandler<GetSiteSettingsQuery, List<SiteSettingDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSiteSettingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SiteSettingDto>> Handle(GetSiteSettingsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SiteSettings.AsQueryable();

        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(s => s.Category == request.Category);
        }

        if (request.IsPublic.HasValue)
        {
            query = query.Where(s => s.IsPublic == request.IsPublic.Value);
        }

        if (!string.IsNullOrEmpty(request.Key))
        {
            query = query.Where(s => s.Key == request.Key);
        }

        var settings = await query
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Key)
            .ToListAsync(cancellationToken);

        return settings.Select(s => new SiteSettingDto
        {
            Id = s.Id,
            Key = s.Key,
            Value = s.Value,
            Description = s.Description,
            DataType = s.DataType,
            Category = s.Category,
            IsPublic = s.IsPublic,
            CreatedDate = s.CreatedDate,
            ModifiedDate = s.ModifiedDate
        }).ToList();
    }
}
