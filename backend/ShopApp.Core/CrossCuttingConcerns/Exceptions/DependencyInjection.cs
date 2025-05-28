using Microsoft.Extensions.DependencyInjection;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Handlers;
using ShopApp.Core.CrossCuttingConcerns.Logging.Serilog;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions;

public static class DependencyInjection
{
    public static IServiceCollection AddExceptionHandling(this IServiceCollection services)
    {
        services.AddSingleton<HttpExceptionHandler>();
        services.AddSingleton<ILoggerService, FileLogger>();
        
        return services;
    }
}
