using System;

namespace ShopApp.Application.DTOs;

public class SiteSettingDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "string";
    public string Category { get; set; } = "general";
    public bool IsPublic { get; set; } = false;
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
}

public class SiteSettingUpdateDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "string";
    public string Category { get; set; } = "general";
    public bool IsPublic { get; set; } = false;
}

public class SiteSettingCreateDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "string";
    public string Category { get; set; } = "general";
    public bool IsPublic { get; set; } = false;
}
