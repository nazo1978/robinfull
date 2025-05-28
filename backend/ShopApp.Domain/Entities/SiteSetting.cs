using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class SiteSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "string"; // string, boolean, number, json
    public string Category { get; set; } = "general"; // general, appearance, features, etc.
    public bool IsPublic { get; set; } = false; // Public settings can be accessed without authentication
}
