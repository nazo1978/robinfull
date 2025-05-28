using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Core.Common;
using ShopApp.Core.Interfaces;
using ShopApp.Core.Pagination;
using ShopApp.Persistence.Contexts;

namespace ShopApp.Persistence.Repositories;

public class AsyncRepository<T> : IAsyncRepository<T> where T : BaseEntity
{
    protected readonly ShopAppDbContext _dbContext;
    protected readonly DbSet<T> _dbSet;

    public AsyncRepository(ShopAppDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = dbContext.Set<T>();
    }

    #region Tekil Veri Getirme İşlemleri

    public virtual async Task<T> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public virtual async Task<T> GetAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    #endregion

    #region Liste Getirme İşlemleri

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    public virtual async Task<IReadOnlyList<T>> GetListAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    public virtual async Task<IReadOnlyList<T>> GetListAsync(Expression<Func<T, bool>> predicate,
                                                  Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
                                                  string? includeString = null,
                                                  bool disableTracking = true,
                                                  CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = _dbSet;

        if (disableTracking)
            query = query.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(includeString))
            query = query.Include(includeString);

        if (predicate != null)
            query = query.Where(predicate);

        if (orderBy != null)
            return await orderBy(query).ToListAsync(cancellationToken);

        return await query.ToListAsync(cancellationToken);
    }

    public virtual async Task<IReadOnlyList<T>> GetListAsync(Expression<Func<T, bool>> predicate,
                                                  Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
                                                  List<Expression<Func<T, object>>>? includes = null,
                                                  bool disableTracking = true,
                                                  CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = _dbSet;

        if (disableTracking)
            query = query.AsNoTracking();

        if (includes != null)
            query = includes.Aggregate(query, (current, include) => current.Include(include));

        if (predicate != null)
            query = query.Where(predicate);

        if (orderBy != null)
            return await orderBy(query).ToListAsync(cancellationToken);

        return await query.ToListAsync(cancellationToken);
    }

    #endregion

    #region Sayfalama İşlemleri

    public virtual async Task<PagedList<T>> GetPagedListAsync(int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        return await PagedList<T>.CreateAsync(_dbSet, pageIndex, pageSize, cancellationToken);
    }

    public virtual async Task<PagedList<T>> GetPagedListAsync(Expression<Func<T, bool>> predicate, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        return await PagedList<T>.CreateAsync(_dbSet.Where(predicate), pageIndex, pageSize, cancellationToken);
    }

    public virtual async Task<PagedList<T>> GetPagedListAsync(Expression<Func<T, bool>> predicate,
                                                   int pageIndex,
                                                   int pageSize,
                                                   Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
                                                   string? includeString = null,
                                                   bool disableTracking = true,
                                                   CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = _dbSet;

        if (disableTracking)
            query = query.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(includeString))
            query = query.Include(includeString);

        if (predicate != null)
            query = query.Where(predicate);

        if (orderBy != null)
            return await PagedList<T>.CreateAsync(orderBy(query), pageIndex, pageSize, cancellationToken);

        return await PagedList<T>.CreateAsync(query, pageIndex, pageSize, cancellationToken);
    }

    public virtual async Task<PagedList<T>> GetPagedListAsync(Expression<Func<T, bool>> predicate,
                                                   int pageIndex,
                                                   int pageSize,
                                                   Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
                                                   List<Expression<Func<T, object>>>? includes = null,
                                                   bool disableTracking = true,
                                                   CancellationToken cancellationToken = default)
    {
        IQueryable<T> query = _dbSet;

        if (disableTracking)
            query = query.AsNoTracking();

        if (includes != null)
            query = includes.Aggregate(query, (current, include) => current.Include(include));

        if (predicate != null)
            query = query.Where(predicate);

        if (orderBy != null)
            return await PagedList<T>.CreateAsync(orderBy(query), pageIndex, pageSize, cancellationToken);

        return await PagedList<T>.CreateAsync(query, pageIndex, pageSize, cancellationToken);
    }

    #endregion

    #region Kontrol İşlemleri

    public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(predicate, cancellationToken);
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(predicate, cancellationToken);
    }

    #endregion

    #region Ekleme İşlemleri

    public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public virtual async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    #endregion

    #region Güncelleme İşlemleri

    public virtual async Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Entry(entity).State = EntityState.Modified;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public virtual async Task UpdateRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        _dbSet.UpdateRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    #endregion

    #region Silme İşlemleri

    public virtual async Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public virtual async Task DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
    {
        _dbSet.RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    #endregion
}