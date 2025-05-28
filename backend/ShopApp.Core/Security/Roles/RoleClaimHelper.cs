using ShopApp.Core.Identity;
using System.Collections.Generic;
using System.Security.Claims;

namespace ShopApp.Core.Security.Roles;

public static class RoleClaimHelper
{
    public static List<Claim> GetRoleClaims(User user)
    {
        var claims = new List<Claim>();

        // Temel rol: Tüm kullanıcılar User rolüne sahiptir
        claims.Add(new Claim(ClaimTypes.Role, Role.User));

        // ApplicationUser ise Customer rolü ekle
        if (user is ApplicationUser appUser)
        {
            claims.Add(new Claim(ClaimTypes.Role, Role.Customer));

            // UserType kontrolü - Admin kullanıcıları
            if (!string.IsNullOrEmpty(appUser.UserType) && appUser.UserType == "Admin")
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.Admin));
            }

            // Bireysel veya Kurumsal müşteri kontrolü
            // Tip kontrolü yerine kullanıcı adı veya email üzerinden kontrol yapabiliriz
            // Gerçek uygulamada veritabanından rol bilgisi çekilebilir
            if (user.Username.Contains("bireysel"))
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.BireyselMusteri));
            }
            else if (user.Username.Contains("kurumsal"))
            {
                claims.Add(new Claim(ClaimTypes.Role, Role.KurumsalMusteri));
            }
        }

        // Fallback admin kontrolü (username bazlı)
        if (user.Username == "admin")
        {
            claims.Add(new Claim(ClaimTypes.Role, Role.Admin));
        }

        return claims;
    }
}
