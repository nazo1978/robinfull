using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class MusteriRepository<T> : AsyncRepository<T>, IMusteriRepository<T> where T : Musteri
{
    public MusteriRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IEnumerable<T>> GetMusterilerByAktifDurumAsync(bool aktifMi, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.AktifMi == aktifMi)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<T>> GetMusterilerByKayitTarihiAsync(DateTime baslangicTarihi, DateTime bitisTarihi, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(m => m.KayitTarihi >= baslangicTarihi && m.KayitTarihi <= bitisTarihi)
            .ToListAsync(cancellationToken);
    }
} 