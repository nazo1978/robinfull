using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.HttpProblemDetails;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ValidationException = ShopApp.Core.CrossCuttingConcerns.Exceptions.Types.ValidationException;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Handlers;

public class HttpExceptionHandler : ExceptionHandler
{
    private HttpResponse? _response;

    public HttpResponse Response
    {
        get => _response ?? throw new ArgumentNullException(nameof(_response));
        set => _response = value;
    }

    public override Task HandleExceptionAsync(Exception exception)
    {
        Response.ContentType = "application/json";
        Response.StatusCode = GetStatusCode(exception);

        string result = GetResponseJson(exception);

        return Response.WriteAsync(result);
    }

    private static string GetResponseJson(Exception exception)
    {
        return exception switch
        {
            BusinessException businessException => JsonSerializer.Serialize(
                new BusinessProblemDetails(businessException.Message)
            ),
            ValidationException validationException => JsonSerializer.Serialize(
                new ValidationProblemDetails(GetValidationErrors(validationException))
            ),
            AuthorizationException authorizationException => JsonSerializer.Serialize(
                new AuthorizationProblemDetails(authorizationException.Message)
            ),
            NotFoundException notFoundException => JsonSerializer.Serialize(
                new NotFoundProblemDetails(notFoundException.Message)
            ),
            _ => JsonSerializer.Serialize(
                new InternalServerErrorProblemDetails(exception.Message)
            )
        };
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            BusinessException => StatusCodes.Status400BadRequest,
            ValidationException => StatusCodes.Status400BadRequest,
            AuthorizationException => StatusCodes.Status401Unauthorized,
            NotFoundException => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };
    }

    private static IEnumerable<ValidationExceptionModel> GetValidationErrors(ValidationException validationException)
    {
        var validationErrors = new List<ValidationExceptionModel>();

        if (validationException.Errors != null)
        {
            foreach (var error in validationException.Errors)
            {
                validationErrors.Add(new ValidationExceptionModel(error.Property, error.Errors));
            }
        }

        return validationErrors;
    }
}
