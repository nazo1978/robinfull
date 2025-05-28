using FluentAssertions;
using FluentValidation.TestHelper;
using ShopApp.Application.Features.BireyselMusteriler.Commands.CreateBireyselMusteri;
using Xunit;

namespace ShopApp.Tests.Features.BireyselMusteriler.Commands;

public class CreateBireyselMusteriCommandValidatorTests
{
    private readonly CreateBireyselMusteriCommandValidator _validator;

    public CreateBireyselMusteriCommandValidatorTests()
    {
        _validator = new CreateBireyselMusteriCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_Username_Is_Empty()
    {
        // Arrange
        var command = new CreateBireyselMusteriCommand
        {
            Username = "",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            TCKN = "12345678901",
            DogumTarihi = DateTime.Now.AddYears(-25),
            Cinsiyet = "Erkek",
            MedeniDurum = "Bekar",
            MeslekBilgisi = "Developer"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_Have_Error_When_Username_Is_Too_Short()
    {
        // Arrange
        var command = new CreateBireyselMusteriCommand
        {
            Username = "ab",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            TCKN = "12345678901",
            DogumTarihi = DateTime.Now.AddYears(-25),
            Cinsiyet = "Erkek",
            MedeniDurum = "Bekar",
            MeslekBilgisi = "Developer"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Username);
    }

    [Fact]
    public void Should_Have_Error_When_Email_Is_Invalid()
    {
        // Arrange
        var command = new CreateBireyselMusteriCommand
        {
            Username = "testuser",
            Password = "Test123!",
            Email = "invalid-email",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            TCKN = "12345678901",
            DogumTarihi = DateTime.Now.AddYears(-25),
            Cinsiyet = "Erkek",
            MedeniDurum = "Bekar",
            MeslekBilgisi = "Developer"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Have_Error_When_TCKN_Is_Invalid()
    {
        // Arrange
        var command = new CreateBireyselMusteriCommand
        {
            Username = "testuser",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            TCKN = "12345678900", // Invalid TCKN
            DogumTarihi = DateTime.Now.AddYears(-25),
            Cinsiyet = "Erkek",
            MedeniDurum = "Bekar",
            MeslekBilgisi = "Developer"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.TCKN);
    }

    [Fact]
    public void Should_Have_Error_When_Age_Is_Under_18()
    {
        // Arrange
        var command = new CreateBireyselMusteriCommand
        {
            Username = "testuser",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address",
            TCKN = "12345678901",
            DogumTarihi = DateTime.Now.AddYears(-17), // Under 18
            Cinsiyet = "Erkek",
            MedeniDurum = "Bekar",
            MeslekBilgisi = "Developer"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.DogumTarihi);
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
    {
        // Arrange
        var command = new CreateBireyselMusteriCommand
        {
            Username = "testuser",
            Password = "Test123!",
            Email = "test@example.com",
            Ad = "Test",
            Soyad = "User",
            Telefon = "5551234567",
            Adres = "Test Address Test Address",
            TCKN = "10000000146", // Valid TCKN
            DogumTarihi = DateTime.Now.AddYears(-25),
            Cinsiyet = "Erkek",
            MedeniDurum = "Bekar",
            MeslekBilgisi = "Developer"
        };

        // Act & Assert
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
