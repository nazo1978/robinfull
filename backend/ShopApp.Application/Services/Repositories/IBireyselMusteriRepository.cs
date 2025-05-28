using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface IBireyselMusteriRepository : IMusteriRepository<BireyselMusteri>
{
    Task<BireyselMusteri> GetByTCKNAsync(string tckn, CancellationToken cancellationToken = default);
    Task<IEnumerable<BireyselMusteri>> GetByDogumTarihiAralikAsync(DateTime baslangicTarihi, DateTime bitisTarihi, CancellationToken cancellationToken = default);
    Task<IEnumerable<BireyselMusteri>> GetByCinsiyetAsync(string cinsiyet, CancellationToken cancellationToken = default);
} 