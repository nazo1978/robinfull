using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Common;
using ShopApp.Core.Pagination;

namespace ShopApp.Core.Interfaces;

public interface IAsyncRepository<T> where T : BaseEntity
{
    // Tekil veri getirme işlemleri
    Task<T> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<T> GetAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    
    // Liste getirme işlemleri
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetListAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetListAsync(Expression<Func<T, bool>> predicate, 
                             Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
                             string includeString = null,
                             bool disableTracking = true,
                             CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetListAsync(Expression<Func<T, bool>> predicate, 
                             Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null, 
                             List<Expression<Func<T, object>>> includes = null,
                             bool disableTracking = true,
                             CancellationToken cancellationToken = default);
    
    // Sayfalama destekli listeleme
    Task<PagedList<T>> GetPagedListAsync(int pageIndex, int pageSize, 
                               CancellationToken cancellationToken = default);
    Task<PagedList<T>> GetPagedListAsync(Expression<Func<T, bool>> predicate, int pageIndex, int pageSize, 
                               CancellationToken cancellationToken = default);
    Task<PagedList<T>> GetPagedListAsync(Expression<Func<T, bool>> predicate, int pageIndex, int pageSize, 
                               Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
                               string includeString = null,
                               bool disableTracking = true,
                               CancellationToken cancellationToken = default);
    Task<PagedList<T>> GetPagedListAsync(Expression<Func<T, bool>> predicate, int pageIndex, int pageSize, 
                               Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
                               List<Expression<Func<T, object>>> includes = null,
                               bool disableTracking = true,
                               CancellationToken cancellationToken = default);
                               
    // Kontrol işlemleri
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    
    // Ekleme işlemleri
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    
    // Güncelleme işlemleri
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    
    // Silme işlemleri
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
} 