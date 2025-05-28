using System;

namespace ShopApp.Core.Identity;

/// <summary>
/// Uygulama kullanıcı sınıfı - kişisel bilgileri içerir
/// </summary>
public class ApplicationUser : User
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public DateTime RegistrationDate { get; set; }

    public ApplicationUser()
    {
        RegistrationDate = DateTime.UtcNow;
        IsActive = true;
        IsDeleted = false;
    }
}
