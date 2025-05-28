using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Identity;

namespace ShopApp.Application.Services.Repositories;

public interface IApplicationUserRepository : IUserRepository
{
    Task<IEnumerable<ApplicationUser>> GetActiveUsersAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationUser>> GetUsersByNameAsync(string firstName, string lastName, CancellationToken cancellationToken = default);
}
