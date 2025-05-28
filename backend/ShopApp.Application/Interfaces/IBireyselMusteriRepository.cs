using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Interfaces;

public interface IBireyselMusteriRepository : IAsyncRepository<BireyselMusteri>
{
    Task<BireyselMusteri> GetByTCKNAsync(string tckn, CancellationToken cancellationToken = default);
}
