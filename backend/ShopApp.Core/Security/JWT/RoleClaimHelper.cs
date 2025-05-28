using ShopApp.Core.Identity;
using ShopApp.Core.Security.Roles;
using System.Collections.Generic;
using System.Security.Claims;

namespace ShopApp.Core.Security.JWT;

public static class RoleClaimHelper
{
    public static IEnumerable<Claim> GetRoleClaims(User user)
    {
        var claims = new List<Claim>();

        // Tüm kullanıcılar User rolüne sahiptir
        claims.Add(new Claim(ClaimTypes.Role, Role.User));

        // Müşteri türüne göre rol ata
        // ApplicationUser'dan türetilen sınıflar için rol kontrolü
        if (user is ApplicationUser appUser)
        {
            // Kullanıcı tipine göre rol ataması
            if (appUser.UserType == "BireyselMusteri")
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Customer));
                claims.Add(new Claim(ClaimTypes.Role, Role.BireyselMusteri));
            }
            else if (appUser.UserType == "KurumsalMusteri")
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Customer));
                claims.Add(new Claim(ClaimTypes.Role, Role.KurumsalMusteri));
            }
        }

        // Admin kontrolü (gerçek uygulamada veritabanından kontrol edilmelidir)
        if (user.Username == "admin")
        {
            claims.Add(new Claim(ClaimTypes.Role, Role.Admin));
        }

        return claims;
    }
}
