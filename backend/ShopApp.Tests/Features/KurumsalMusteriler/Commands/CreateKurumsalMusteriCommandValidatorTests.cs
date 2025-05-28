using FluentAssertions;
using FluentValidation.TestHelper;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;
using Xunit;

namespace ShopApp.Tests.Features.KurumsalMusteriler.Commands;

public class CreateKurumsalMusteriCommandValidatorTests
{
    private readonly CreateKurumsalMusteriCommandValidator _validator;

    public CreateKurumsalMusteriCommandValidatorTests()
    {
        _validator = new CreateKurumsalMusteriCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_Username_Is_Empty()
    {
        // Arrange
        var command = new CreateKurumsalMusteriCommand
        {
            Username = "",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            FirmaAdi = "Test Company",
            VergiDairesi = "Kadıköy",
            VergiNo = "1234567890",
            FaaliyetAlani = "Software",
            YetkiliKisiAdi = "John",
            YetkiliKisiSoyadi = "Doe",
            YetkiliKisiTelefonu = "5551234567",
            YetkiliKisiEmail = "john@company.com"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_Have_Error_When_VergiNo_Is_Invalid()
    {
        // Arrange
        var command = new CreateKurumsalMusteriCommand
        {
            Username = "testcompany",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            FirmaAdi = "Test Company",
            VergiDairesi = "Kadıköy",
            VergiNo = "123456789", // Invalid - should be 10 digits
            FaaliyetAlani = "Software",
            YetkiliKisiAdi = "John",
            YetkiliKisiSoyadi = "Doe",
            YetkiliKisiTelefonu = "5551234567",
            YetkiliKisiEmail = "john@company.com"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.VergiNo);
    }

    [Fact]
    public void Should_Have_Error_When_YetkiliKisiEmail_Is_Invalid()
    {
        // Arrange
        var command = new CreateKurumsalMusteriCommand
        {
            Username = "testcompany",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            FirmaAdi = "Test Company",
            VergiDairesi = "Kadıköy",
            VergiNo = "1234567890",
            FaaliyetAlani = "Software",
            YetkiliKisiAdi = "John",
            YetkiliKisiSoyadi = "Doe",
            YetkiliKisiTelefonu = "5551234567",
            YetkiliKisiEmail = "invalid-email" // Invalid email
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.YetkiliKisiEmail);
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
    {
        // Arrange
        var command = new CreateKurumsalMusteriCommand
        {
            Username = "testcompany",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address Test Address",
            FirmaAdi = "Test Company",
            VergiDairesi = "Kadıköy",
            VergiNo = "1234567890",
            FaaliyetAlani = "Software",
            YetkiliKisiAdi = "John",
            YetkiliKisiSoyadi = "Doe",
            YetkiliKisiTelefonu = "5551234567",
            YetkiliKisiEmail = "john@company.com"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
