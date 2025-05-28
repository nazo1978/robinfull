using ShopApp.Core.Identity;
using ShopApp.Core.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Interfaces;

public interface IApplicationUserRepository : IAsyncRepository<ApplicationUser>
{
    Task<IEnumerable<ApplicationUser>> GetActiveUsersAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<ApplicationUser>> GetUsersByNameAsync(string firstName, string lastName, CancellationToken cancellationToken = default);
}
