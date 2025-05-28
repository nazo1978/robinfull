using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Commands.DeleteUser;
using ShopApp.Application.Commands.UpdateUser;
using ShopApp.Application.DTOs;
using ShopApp.Application.Queries.GetUsers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : BaseController
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<UserDto>>> GetUsers([FromQuery] GetUsersQuery query)
    {
        try
        {
            // Only admin can access user management
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var users = await _mediator.Send(query);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, UpdateUserCommand command)
    {
        try
        {
            // Only admin can update users
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            command.Id = id;
            var user = await _mediator.Send(command);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> DeleteUser(Guid id)
    {
        try
        {
            // Only admin can delete users
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var command = new DeleteUserCommand { Id = id };
            var result = await _mediator.Send(command);
            return Ok(new { success = result, message = "Kullanıcı başarıyla silindi" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }
}
