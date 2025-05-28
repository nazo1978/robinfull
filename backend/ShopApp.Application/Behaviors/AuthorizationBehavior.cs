using MediatR;
using Microsoft.AspNetCore.Http;
using ShopApp.Core.Application.Security;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Behaviors;

public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthorizationBehavior(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Eğer request ISecuredRequest'i implemente ediyorsa, yetkilendirme kontrolü yap
        if (request is ISecuredRequest securedRequest)
        {
            var claimsPrincipal = _httpContextAccessor.HttpContext?.User;
            
            if (claimsPrincipal == null)
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }
            
            var securedOperation = new SecuredOperation(securedRequest.Roles, claimsPrincipal);
            securedOperation.Validate();
        }
        
        // Yetkilendirme başarılı veya gerekli değilse, pipeline'a devam et
        return await next();
    }
}
