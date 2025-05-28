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

        // ApplicationUser için rol ataması
        if (user is ApplicationUser appUser)
        {
            // UserType'a göre rol ataması
            switch (appUser.UserType?.ToLower())
            {
                case "admin":
                    claims.Add(new Claim(ClaimTypes.Role, Role.Admin));
                    claims.Add(new Claim(ClaimTypes.Role, Role.Customer)); // Admin aynı zamanda customer işlemleri yapabilir
                    break;

                case "bireyselmusteri":
                    claims.Add(new Claim(ClaimTypes.Role, Role.Customer));
                    claims.Add(new Claim(ClaimTypes.Role, Role.BireyselMusteri));
                    break;

                case "kurumsalmusteri":
                    claims.Add(new Claim(ClaimTypes.Role, Role.Customer));
                    claims.Add(new Claim(ClaimTypes.Role, Role.KurumsalMusteri));
                    break;

                default: // "user" veya diğer durumlar
                    claims.Add(new Claim(ClaimTypes.Role, Role.Customer));
                    break;
            }
        }

        // Fallback: Username kontrolü (geriye dönük uyumluluk için)
        if (user.Username == "admin" || user.Email == "admin@shopapp.com")
        {
            claims.Add(new Claim(ClaimTypes.Role, Role.Admin));
        }

        return claims;
    }
}
