using System;
using System.Collections.Generic;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;

public class ValidationException : Exception
{
    public IEnumerable<ValidationExceptionModel> Errors { get; }

    public ValidationException()
        : base("Validation error(s) occurred")
    {
        Errors = Array.Empty<ValidationExceptionModel>();
    }

    public ValidationException(string message)
        : base(message)
    {
        Errors = Array.Empty<ValidationExceptionModel>();
    }

    public ValidationException(string message, Exception innerException)
        : base(message, innerException)
    {
        Errors = Array.Empty<ValidationExceptionModel>();
    }

    public ValidationException(IEnumerable<ValidationExceptionModel> errors)
        : base(BuildErrorMessage(errors))
    {
        Errors = errors;
    }

    private static string BuildErrorMessage(IEnumerable<ValidationExceptionModel> errors)
    {
        var arr = new List<string>();

        foreach (var error in errors)
        {
            arr.Add($"{error.Property}: {string.Join(", ", error.Errors)}");
        }

        return $"Validation failed: {string.Join(" | ", arr)}";
    }
}

public class ValidationExceptionModel
{
    public string Property { get; set; }
    public IEnumerable<string> Errors { get; set; }

    public ValidationExceptionModel(string property, IEnumerable<string> errors)
    {
        Property = property;
        Errors = errors;
    }
}
