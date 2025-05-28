using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Core.Identity;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class UserRepository : AsyncRepository<User>, IUserRepository
{
    private readonly ShopAppDbContext _context;

    public UserRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
        _context = dbContext;
    }

    public async Task<User> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }
}
