using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.HttpProblemDetails;

public class ValidationProblemDetails : ProblemDetails
{
    public IEnumerable<ValidationExceptionModel> Errors { get; init; }

    public ValidationProblemDetails(IEnumerable<ValidationExceptionModel> errors)
    {
        Title = "Validation error(s)";
        Detail = "One or more validation errors occurred";
        Status = StatusCodes.Status400BadRequest;
        Type = "https://example.com/probs/validation";
        Instance = "";
        Errors = errors;
    }
}
