using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class KurumsalMusteriRepository : MusteriRepository<KurumsalMusteri>, IKurumsalMusteriRepository
{
    private readonly ShopAppDbContext _context;

    public KurumsalMusteriRepository(ShopAppDbContext dbContext) : base(dbContext)
    {
        _context = dbContext;
    }

    public async Task<KurumsalMusteri> GetByVergiNoAsync(string vergiNo, CancellationToken cancellationToken = default)
    {
        return await _context.KurumsalMusteriler
            .FirstOrDefaultAsync(m => m.VergiNo == vergiNo, cancellationToken);
    }

    public async Task<IEnumerable<KurumsalMusteri>> GetByFaaliyetAlaniAsync(string faaliyetAlani, CancellationToken cancellationToken = default)
    {
        return await _context.KurumsalMusteriler
            .Where(m => m.FaaliyetAlani == faaliyetAlani)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<KurumsalMusteri>> GetByVergiDairesiAsync(string vergiDairesi, CancellationToken cancellationToken = default)
    {
        return await _context.KurumsalMusteriler
            .Where(m => m.VergiDairesi == vergiDairesi)
            .ToListAsync(cancellationToken);
    }
}