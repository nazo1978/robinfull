using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class BireyselMusteriRepository : MusteriRepository<BireyselMusteri>, IBireyselMusteriRepository
{
    private readonly ShopAppDbContext _context;

    public BireyselMusteriRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
        _context = dbContext;
    }

    public async Task<BireyselMusteri> GetByTCKNAsync(string tckn, CancellationToken cancellationToken = default)
    {
        return await _context.BireyselMusteriler
            .FirstOrDefaultAsync(m => m.TCKN == tckn, cancellationToken);
    }

    public async Task<IEnumerable<BireyselMusteri>> GetByDogumTarihiAralikAsync(DateTime baslangicTarihi, DateTime bitisTarihi, CancellationToken cancellationToken = default)
    {
        return await _context.BireyselMusteriler
            .Where(m => m.DogumTarihi >= baslangicTarihi && m.DogumTarihi <= bitisTarihi)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<BireyselMusteri>> GetByCinsiyetAsync(string cinsiyet, CancellationToken cancellationToken = default)
    {
        return await _context.BireyselMusteriler
            .Where(m => m.Cinsiyet == cinsiyet)
            .ToListAsync(cancellationToken);
    }
}