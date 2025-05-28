using System.Threading;
using System.Threading.Tasks;
using MediatR;

namespace ShopApp.Application.Common;

public abstract class BaseQueryHandler<TQuery, TResult> : IRequestHandler<TQuery, TResult>
    where TQuery : IRequest<TResult>
{
    public abstract Task<TResult> Handle(TQuery request, CancellationToken cancellationToken);
} 