using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using ShopApp.Application.Behaviors;

using ShopApp.Application.Features.BireyselMusteriler.Rules;
using ShopApp.Application.Features.KurumsalMusteriler.Rules;

using ShopApp.Application.Services.Discounts;

namespace ShopApp.Application;

public static class ServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // MediatR
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehavior<,>));
        });

        // HttpContextAccessor for Authorization
        services.AddHttpContextAccessor();

        // FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // Business Rules
        services.AddScoped<BireyselMusteriBusinessRules>();
        services.AddScoped<KurumsalMusteriBusinessRules>();

        // Services
        services.AddScoped<IDiscountService, DiscountService>();

        return services;
    }
}
