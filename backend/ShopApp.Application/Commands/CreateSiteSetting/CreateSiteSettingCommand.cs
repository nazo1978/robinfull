using MediatR;
using ShopApp.Application.DTOs;

namespace ShopApp.Application.Commands.CreateSiteSetting;

public class CreateSiteSettingCommand : IRequest<SiteSettingDto>
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "string";
    public string Category { get; set; } = "general";
    public bool IsPublic { get; set; } = false;
}
