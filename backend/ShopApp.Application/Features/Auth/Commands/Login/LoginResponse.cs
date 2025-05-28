using ShopApp.Core.Security.JWT;

namespace ShopApp.Application.Features.Auth.Commands.Login;

public class LoginResponse
{
    public AccessToken AccessToken { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
}
