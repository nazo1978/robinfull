using FluentValidation;

namespace ShopApp.Application.Commands.AddToCart;

public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty();
            
        RuleFor(x => x.ProductId)
            .NotEmpty();
            
        RuleFor(x => x.Quantity)
            .GreaterThan(0);
    }
} 