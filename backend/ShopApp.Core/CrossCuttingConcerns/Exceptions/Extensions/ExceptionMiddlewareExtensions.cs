using Microsoft.AspNetCore.Builder;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Middlewares;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Extensions;

public static class ExceptionMiddlewareExtensions
{
    public static void ConfigureCustomExceptionMiddleware(this IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionMiddleware>();
    }
}
