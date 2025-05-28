using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Features.Auth.Commands.Login;
using ShopApp.Application.Features.Auth.Commands.Register;
using System.Threading.Tasks;

namespace ShopApp.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : BaseController
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand loginCommand)
    {
        var result = await Mediator.Send(loginCommand);
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand registerCommand)
    {
        var result = await Mediator.Send(registerCommand);
        return Ok(result);
    }
}
