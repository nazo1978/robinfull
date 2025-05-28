using ShopApp.Core.Identity;

namespace ShopApp.Core.Security.JWT;

public interface IJwtHelper
{
    AccessToken CreateToken(User user);
}
