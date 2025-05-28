using MediatR;
using ShopApp.Application.DTOs;
using System.Collections.Generic;

namespace ShopApp.Application.Queries.GetSiteSettings;

public class GetSiteSettingsQuery : IRequest<List<SiteSettingDto>>
{
    public string? Category { get; set; }
    public bool? IsPublic { get; set; }
    public string? Key { get; set; }
}
