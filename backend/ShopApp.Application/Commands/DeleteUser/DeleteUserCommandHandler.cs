using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.DeleteUser;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted, cancellationToken);

        if (user == null)
        {
            throw new Exception("Kullanıcı bulunamadı");
        }

        // Soft delete
        user.IsDeleted = true;
        user.IsActive = false;
        user.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
