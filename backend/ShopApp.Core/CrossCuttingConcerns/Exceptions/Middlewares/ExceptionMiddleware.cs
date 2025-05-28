using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Handlers;
using ShopApp.Core.CrossCuttingConcerns.Logging;
using ShopApp.Core.CrossCuttingConcerns.Logging.Serilog;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly HttpExceptionHandler _httpExceptionHandler;
    private readonly ILoggerService _loggerService;

    public ExceptionMiddleware(
        RequestDelegate next,
        HttpExceptionHandler httpExceptionHandler,
        ILoggerService loggerService)
    {
        _next = next;
        _httpExceptionHandler = httpExceptionHandler;
        _loggerService = loggerService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await LogException(context, exception);
            await HandleExceptionAsync(context, exception);
        }
    }

    private Task LogException(HttpContext context, Exception exception)
    {
        var logDetail = new LogDetail
        {
            MethodName = $"{context.Request.Method} {context.Request.Path}",
            User = context.User.Identity?.Name ?? "?",
            ExceptionMessage = exception.Message
        };

        _loggerService.Error(logDetail);
        
        return Task.CompletedTask;
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        _httpExceptionHandler.Response = context.Response;
        return _httpExceptionHandler.HandleExceptionAsync(exception);
    }
}
