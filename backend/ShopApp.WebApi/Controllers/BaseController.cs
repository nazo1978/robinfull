using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;

namespace ShopApp.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public abstract class BaseController : ControllerBase
{
    private IMediator _mediator;
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>();

    protected bool IsAdmin()
    {
        if (User?.Identity?.IsAuthenticated != true)
            return false;

        // Check for UserType claim
        var userTypeClaim = User.FindFirst("UserType")?.Value;
        if (userTypeClaim == "Admin")
            return true;

        // Check for role claim
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (roleClaim == "Admin")
            return true;

        // Check if user is in Admin role
        return User.IsInRole("Admin");
    }

    protected string GetCurrentUserId()
    {
        return User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    protected string GetCurrentUserEmail()
    {
        return User?.FindFirst(ClaimTypes.Email)?.Value;
    }
}
