using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ShopApp.Core.Identity;
using ShopApp.Core.Security.Roles;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;

namespace ShopApp.Core.Security.JWT;

public class JwtHelper : IJwtHelper
{
    private readonly TokenOptions _tokenOptions;
    private DateTime _accessTokenExpiration;

    public JwtHelper(IConfiguration configuration)
    {
        var tokenOptionsSection = configuration.GetSection("TokenOptions");
        _tokenOptions = new TokenOptions
        {
            Audience = tokenOptionsSection["Audience"],
            Issuer = tokenOptionsSection["Issuer"],
            AccessTokenExpiration = int.Parse(tokenOptionsSection["AccessTokenExpiration"] ?? "60"),
            SecurityKey = tokenOptionsSection["SecurityKey"]
        };

        if (_tokenOptions.SecurityKey == null)
        {
            throw new ArgumentNullException(nameof(configuration), "TokenOptions section is missing in configuration");
        }
    }

    public AccessToken CreateToken(User user)
    {
        _accessTokenExpiration = DateTime.UtcNow.AddMinutes(_tokenOptions.AccessTokenExpiration);
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_tokenOptions.SecurityKey));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);
        var jwt = CreateJwtSecurityToken(_tokenOptions, user, signingCredentials);
        var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
        var token = jwtSecurityTokenHandler.WriteToken(jwt);

        return new AccessToken
        {
            Token = token,
            Expiration = _accessTokenExpiration
        };
    }

    private JwtSecurityToken CreateJwtSecurityToken(TokenOptions tokenOptions, User user, SigningCredentials signingCredentials)
    {
        var jwt = new JwtSecurityToken(
            issuer: tokenOptions.Issuer,
            audience: tokenOptions.Audience,
            expires: _accessTokenExpiration,
            notBefore: DateTime.UtcNow,
            claims: SetClaims(user),
            signingCredentials: signingCredentials
        );
        return jwt;
    }

    private IEnumerable<Claim> SetClaims(User user)
    {
        var claims = new List<Claim>();

        // Temel kullanıcı bilgileri
        claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
        claims.Add(new Claim(ClaimTypes.Email, user.Email));
        claims.Add(new Claim(ClaimTypes.Name, user.Username));

        // UserType claim'ini ekle
        if (!string.IsNullOrEmpty(user.UserType))
        {
            claims.Add(new Claim("UserType", user.UserType));

            // UserType'a göre rol ekle
            if (user.UserType == "Admin")
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
            }
            else if (user.UserType == "Seller")
            {
                claims.Add(new Claim(ClaimTypes.Role, "Seller"));
            }
            else
            {
                claims.Add(new Claim(ClaimTypes.Role, "User"));
            }
        }

        // Eğer ApplicationUser ise, ek bilgileri ekle
        if (user is ApplicationUser appUser)
        {
            claims.Add(new Claim(ClaimTypes.GivenName, appUser.FirstName));
            claims.Add(new Claim(ClaimTypes.Surname, appUser.LastName));
        }

        return claims;
    }
}
