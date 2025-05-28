using MediatR;
using ShopApp.Application.DTOs;
using System.Collections.Generic;

namespace ShopApp.Application.Queries.GetUsers;

public class GetUsersQuery : IRequest<List<UserDto>>
{
    public string? SearchTerm { get; set; }
    public string? UserType { get; set; }
    public bool? IsActive { get; set; }
}
