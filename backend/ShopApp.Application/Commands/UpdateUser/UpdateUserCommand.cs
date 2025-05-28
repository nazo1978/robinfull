using MediatR;
using ShopApp.Application.DTOs;
using System;

namespace ShopApp.Application.Commands.UpdateUser;

public class UpdateUserCommand : IRequest<UserDto>
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool IsActive { get; set; }
    public string UserType { get; set; }
}
