using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using System;
using System.Linq;
using System.Security.Claims;

namespace ShopApp.Core.Application.Security;

public class SecuredOperation
{
    private readonly string[] _roles;
    private readonly ClaimsPrincipal _claimsPrincipal;

    public SecuredOperation(string[] roles, ClaimsPrincipal claimsPrincipal)
    {
        _roles = roles;
        _claimsPrincipal = claimsPrincipal ?? throw new ArgumentNullException(nameof(claimsPrincipal));
    }

    public void Validate()
    {
        if (_roles.Length == 0)
        {
            return; // Rol belirtilmemişse herkes erişebilir
        }

        bool isAuthorized = false;
        
        // Kullanıcının rollerini kontrol et
        foreach (var role in _roles)
        {
            if (_claimsPrincipal.IsInRole(role))
            {
                isAuthorized = true;
                break;
            }
        }

        if (!isAuthorized)
        {
            throw new AuthorizationException("You are not authorized to access this resource.");
        }
    }
}
