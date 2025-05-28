using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Interfaces;

public interface IMusteriRepository<T> : IAsyncRepository<T> where T : Musteri
{
}
