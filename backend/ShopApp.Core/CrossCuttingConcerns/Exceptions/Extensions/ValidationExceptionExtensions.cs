using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ValidationException = ShopApp.Core.CrossCuttingConcerns.Exceptions.Types.ValidationException;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Extensions;

public static class ValidationExceptionExtensions
{
    public static ValidationException ToValidationException(this FluentValidation.ValidationException validationException)
    {
        var validationErrors = validationException.Errors
            .GroupBy(
                x => x.PropertyName,
                x => x.ErrorMessage,
                (propertyName, errorMessages) => new ValidationExceptionModel(
                    propertyName,
                    errorMessages.Distinct().ToList()
                )
            ).ToList();

        return new ValidationException(validationErrors);
    }
}
