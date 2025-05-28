using MediatR;
using ShopApp.Application.DTOs;
using System;

namespace ShopApp.Application.Commands.UpdateSiteSetting;

public class UpdateSiteSettingCommand : IRequest<SiteSettingDto>
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "string";
    public string Category { get; set; } = "general";
    public bool IsPublic { get; set; } = false;
}
