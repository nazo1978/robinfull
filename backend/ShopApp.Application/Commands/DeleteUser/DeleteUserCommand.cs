using MediatR;
using System;

namespace ShopApp.Application.Commands.DeleteUser;

public class DeleteUserCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}
