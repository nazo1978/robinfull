using FluentValidation;

namespace ShopApp.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("Kullanıcı ID'si gereklidir.");

        RuleFor(x => x.OrderItems)
            .NotEmpty()
            .WithMessage("Sipariş öğeleri gereklidir.")
            .Must(items => items.Count > 0)
            .WithMessage("En az bir sipariş öğesi olmalıdır.");

        RuleForEach(x => x.OrderItems).SetValidator(new CreateOrderItemDtoValidator());

        RuleFor(x => x.Shipping)
            .NotNull()
            .WithMessage("Teslimat bilgileri gereklidir.")
            .SetValidator(new CreateShippingInfoDtoValidator());

        RuleFor(x => x.ItemsPrice)
            .GreaterThan(0)
            .WithMessage("Ürün fiyatı 0'dan büyük olmalıdır.");

        RuleFor(x => x.TaxPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Vergi tutarı 0 veya pozitif olmalıdır.");

        RuleFor(x => x.ShippingPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Kargo ücreti 0 veya pozitif olmalıdır.");

        RuleFor(x => x.TotalPrice)
            .GreaterThan(0)
            .WithMessage("Toplam fiyat 0'dan büyük olmalıdır.");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notlar en fazla 500 karakter olabilir.");
    }
}

public class CreateOrderItemDtoValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .WithMessage("Ürün ID'si gereklidir.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Miktar 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo(1000)
            .WithMessage("Miktar 1000'den fazla olamaz.");

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0)
            .WithMessage("Birim fiyat 0'dan büyük olmalıdır.");

        RuleFor(x => x.DiscountRate)
            .GreaterThanOrEqualTo(0)
            .WithMessage("İndirim oranı 0 veya pozitif olmalıdır.")
            .LessThanOrEqualTo(100)
            .WithMessage("İndirim oranı %100'den fazla olamaz.");

        RuleFor(x => x.DiscountAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("İndirim tutarı 0 veya pozitif olmalıdır.");
    }
}

public class CreateShippingInfoDtoValidator : AbstractValidator<CreateShippingInfoDto>
{
    public CreateShippingInfoDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Teslimat adı gereklidir.")
            .MaximumLength(100)
            .WithMessage("Teslimat adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("Teslimat adresi gereklidir.")
            .MaximumLength(500)
            .WithMessage("Teslimat adresi en fazla 500 karakter olabilir.");

        RuleFor(x => x.City)
            .NotEmpty()
            .WithMessage("Şehir gereklidir.")
            .MaximumLength(50)
            .WithMessage("Şehir en fazla 50 karakter olabilir.");

        RuleFor(x => x.PostalCode)
            .NotEmpty()
            .WithMessage("Posta kodu gereklidir.")
            .Matches(@"^\d{5}$")
            .WithMessage("Posta kodu 5 haneli olmalıdır.");

        RuleFor(x => x.Country)
            .NotEmpty()
            .WithMessage("Ülke gereklidir.")
            .MaximumLength(50)
            .WithMessage("Ülke en fazla 50 karakter olabilir.");

        RuleFor(x => x.Phone)
            .NotEmpty()
            .WithMessage("Telefon numarası gereklidir.")
            .Matches(@"^(\+90|0)?[5][0-9]{9}$")
            .WithMessage("Geçerli bir Türkiye telefon numarası giriniz.");
    }
}
