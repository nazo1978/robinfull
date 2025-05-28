using System;

namespace ShopApp.Application.DTOs;

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public bool EmailConfirmed { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public string UserType { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ModifiedDate { get; set; }
}
