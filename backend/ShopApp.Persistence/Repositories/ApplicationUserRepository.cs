using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Core.Identity;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class ApplicationUserRepository : AsyncRepository<ApplicationUser>, IApplicationUserRepository
{
    private readonly ShopAppDbContext _context;

    public ApplicationUserRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
        _context = dbContext;
    }

    public async Task<IEnumerable<ApplicationUser>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .OfType<ApplicationUser>()
            .Where(u => u.IsActive && !u.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ApplicationUser>> GetUsersByNameAsync(string firstName, string lastName, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .OfType<ApplicationUser>()
            .Where(u => u.FirstName.Contains(firstName) && u.LastName.Contains(lastName))
            .ToListAsync(cancellationToken);
    }
}
