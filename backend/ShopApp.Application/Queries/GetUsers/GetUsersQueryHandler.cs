using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Queries.GetUsers;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users.AsQueryable();

        // Search filter
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            query = query.Where(u => u.Username.Contains(request.SearchTerm) || 
                                   u.Email.Contains(request.SearchTerm));
        }

        // UserType filter
        if (!string.IsNullOrEmpty(request.UserType))
        {
            query = query.Where(u => u.UserType == request.UserType);
        }

        // IsActive filter
        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        // Exclude deleted users
        query = query.Where(u => !u.IsDeleted);

        return await query
            .OrderByDescending(u => u.CreatedDate)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                EmailConfirmed = u.EmailConfirmed,
                LastLoginDate = u.LastLoginDate,
                IsActive = u.IsActive,
                IsDeleted = u.IsDeleted,
                UserType = u.UserType,
                CreatedDate = u.CreatedDate,
                ModifiedDate = u.ModifiedDate
            })
            .ToListAsync(cancellationToken);
    }
}
