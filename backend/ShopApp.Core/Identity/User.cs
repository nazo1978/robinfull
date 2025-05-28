using System;
using ShopApp.Core.Common;

namespace ShopApp.Core.Identity;

/// <summary>
/// Temel kullanıcı sınıfı - sadece giriş bilgilerini içerir
/// </summary>
public class User : BaseEntity
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string PasswordSalt { get; set; }
    public bool EmailConfirmed { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public string UserType { get; set; } = "User"; // Admin, User, Seller
}
