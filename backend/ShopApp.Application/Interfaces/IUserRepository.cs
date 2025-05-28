using ShopApp.Core.Identity;
using ShopApp.Core.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Interfaces;

public interface IUserRepository : IAsyncRepository<User>
{
    Task<User> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
