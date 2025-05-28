using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Interfaces;

public interface IKurumsalMusteriRepository : IAsyncRepository<KurumsalMusteri>
{
    Task<KurumsalMusteri> GetByVergiNoAsync(string vergiNo, CancellationToken cancellationToken = default);
}
