using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new Exception("Kullanıcı bulunamadı");
        }

        // Check if email is already taken by another user
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Id != request.Id && !u.IsDeleted, cancellationToken);

        if (existingUser != null)
        {
            throw new Exception("Bu email adresi başka bir kullanıcı tarafından kullanılıyor");
        }

        // Check if username is already taken by another user
        var existingUsername = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.Id != request.Id && !u.IsDeleted, cancellationToken);

        if (existingUsername != null)
        {
            throw new Exception("Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor");
        }

        user.Username = request.Username;
        user.Email = request.Email;
        user.EmailConfirmed = request.EmailConfirmed;
        user.IsActive = request.IsActive;
        user.UserType = request.UserType;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            LastLoginDate = user.LastLoginDate,
            IsActive = user.IsActive,
            IsDeleted = user.IsDeleted,
            UserType = user.UserType,
            CreatedDate = user.CreatedDate,
            ModifiedDate = user.ModifiedDate
        };
    }
}
