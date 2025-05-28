using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface IMusteriRepository<T> : IAsyncRepository<T> where T : Musteri
{
    Task<IEnumerable<T>> GetMusterilerByAktifDurumAsync(bool aktifMi, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetMusterilerByKayitTarihiAsync(DateTime baslangicTarihi, DateTime bitisTarihi, CancellationToken cancellationToken = default);
} 