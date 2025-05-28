using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Identity;
using ShopApp.Core.Interfaces;

namespace ShopApp.Application.Services.Repositories;

public interface IUserRepository : IAsyncRepository<User>
{
    Task<User> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
