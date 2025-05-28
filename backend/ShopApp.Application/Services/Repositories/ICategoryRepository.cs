using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ShopApp.Core.Interfaces;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Services.Repositories;

public interface ICategoryRepository : IAsyncRepository<Category>
{
    Task<IEnumerable<Category>> GetCategoriesWithProductsAsync(CancellationToken cancellationToken = default);
} 