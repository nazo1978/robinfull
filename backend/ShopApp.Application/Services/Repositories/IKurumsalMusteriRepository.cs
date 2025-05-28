using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface IKurumsalMusteriRepository : IMusteriRepository<KurumsalMusteri>
{
    Task<KurumsalMusteri> GetByVergiNoAsync(string vergiNo, CancellationToken cancellationToken = default);
    Task<IEnumerable<KurumsalMusteri>> GetByFaaliyetAlaniAsync(string faaliyetAlani, CancellationToken cancellationToken = default);
    Task<IEnumerable<KurumsalMusteri>> GetByVergiDairesiAsync(string vergiDairesi, CancellationToken cancellationToken = default);
} 