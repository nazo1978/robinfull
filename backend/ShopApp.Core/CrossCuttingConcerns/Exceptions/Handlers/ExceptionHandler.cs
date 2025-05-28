using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Handlers;

public abstract class ExceptionHandler
{
    public Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        return Task.CompletedTask;
    }

    public abstract Task HandleExceptionAsync(Exception exception);
}
