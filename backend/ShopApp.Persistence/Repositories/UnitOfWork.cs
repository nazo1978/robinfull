using System;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Interfaces;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ShopAppDbContext _context;
    private bool _disposed;

    public UnitOfWork(ShopAppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        // Burada domain eventler ve diğer işlemler yapılabilir
        await SaveChangesAsync(cancellationToken);
        return true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
        }
        _disposed = true;
    }
} 