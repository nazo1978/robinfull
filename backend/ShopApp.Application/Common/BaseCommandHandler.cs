using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ShopApp.Core.Interfaces;

namespace ShopApp.Application.Common;

public abstract class BaseCommandHandler<TCommand, TResult> : IRequestHandler<TCommand, TResult>
    where TCommand : IRequest<TResult>
{
    protected readonly IUnitOfWork UnitOfWork;

    protected BaseCommandHandler(IUnitOfWork unitOfWork)
    {
        UnitOfWork = unitOfWork;
    }

    public abstract Task<TResult> Handle(TCommand request, CancellationToken cancellationToken);
} 