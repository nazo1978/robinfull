using System;

namespace ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;

public class BusinessException : Exception
{
    public BusinessException(string message) : base(message)
    {
    }
}
