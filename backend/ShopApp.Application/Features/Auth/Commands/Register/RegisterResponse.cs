using ShopApp.Core.Security.JWT;

namespace ShopApp.Application.Features.Auth.Commands.Register;

public class RegisterResponse
{
    public AccessToken AccessToken { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
}
