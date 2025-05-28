using FluentValidation;

namespace ShopApp.Application.Features.BireyselMusteriler.Commands.CreateBireyselMusteri;

public class CreateBireyselMusteriCommandValidator : AbstractValidator<CreateBireyselMusteriCommand>
{
    public CreateBireyselMusteriCommandValidator()
    {
        // User bilgileri validasyonu
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Kullanıcı adı boş olamaz.")
            .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Kullanıcı adı en fazla 50 karakter olabilir.")
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre boş olamaz.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("Şifre en fazla 100 karakter olabilir.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi boş olamaz.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
            .MaximumLength(100).WithMessage("E-posta adresi en fazla 100 karakter olabilir.");

        // Kişisel bilgiler validasyonu
        RuleFor(x => x.Ad)
            .NotEmpty().WithMessage("Ad boş olamaz.")
            .MinimumLength(2).WithMessage("Ad en az 2 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Ad en fazla 50 karakter olabilir.")
            .Matches("^[a-zA-ZçğıöşüÇĞIİÖŞÜ ]+$").WithMessage("Ad sadece harf ve boşluk içerebilir.");

        RuleFor(x => x.Soyad)
            .NotEmpty().WithMessage("Soyad boş olamaz.")
            .MinimumLength(2).WithMessage("Soyad en az 2 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Soyad en fazla 50 karakter olabilir.")
            .Matches("^[a-zA-ZçğıöşüÇĞIİÖŞÜ ]+$").WithMessage("Soyad sadece harf ve boşluk içerebilir.");

        RuleFor(x => x.Telefon)
            .NotEmpty().WithMessage("Telefon numarası boş olamaz.")
            .Matches(@"^[0-9]{10,11}$").WithMessage("Telefon numarası 10-11 haneli olmalıdır.");

        RuleFor(x => x.Adres)
            .NotEmpty().WithMessage("Adres boş olamaz.")
            .MinimumLength(10).WithMessage("Adres en az 10 karakter olmalıdır.")
            .MaximumLength(500).WithMessage("Adres en fazla 500 karakter olabilir.");

        // Bireysel müşteri bilgileri validasyonu
        RuleFor(x => x.TCKN)
            .NotEmpty().WithMessage("TCKN boş olamaz.")
            .Matches(@"^[0-9]{11}$").WithMessage("TCKN 11 haneli olmalıdır.")
            .Must(BeValidTCKN).WithMessage("Geçerli bir TCKN giriniz.");

        RuleFor(x => x.DogumTarihi)
            .NotEmpty().WithMessage("Doğum tarihi boş olamaz.")
            .LessThan(DateTime.Now.AddYears(-18)).WithMessage("Yaş 18'den küçük olamaz.")
            .GreaterThan(DateTime.Now.AddYears(-120)).WithMessage("Yaş 120'den büyük olamaz.");

        RuleFor(x => x.Cinsiyet)
            .NotEmpty().WithMessage("Cinsiyet boş olamaz.")
            .Must(x => x == "Erkek" || x == "Kadın").WithMessage("Cinsiyet 'Erkek' veya 'Kadın' olmalıdır.");

        RuleFor(x => x.MedeniDurum)
            .NotEmpty().WithMessage("Medeni durum boş olamaz.")
            .Must(x => x == "Bekar" || x == "Evli" || x == "Boşanmış" || x == "Dul")
            .WithMessage("Medeni durum 'Bekar', 'Evli', 'Boşanmış' veya 'Dul' olmalıdır.");

        RuleFor(x => x.MeslekBilgisi)
            .NotEmpty().WithMessage("Meslek bilgisi boş olamaz.")
            .MinimumLength(2).WithMessage("Meslek bilgisi en az 2 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("Meslek bilgisi en fazla 100 karakter olabilir.");
    }

    private bool BeValidTCKN(string tckn)
    {
        if (string.IsNullOrEmpty(tckn) || tckn.Length != 11)
            return false;

        if (!tckn.All(char.IsDigit))
            return false;

        // TCKN algoritması kontrolü
        int[] digits = tckn.Select(c => int.Parse(c.ToString())).ToArray();
        
        int sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int sum2 = digits[1] + digits[3] + digits[5] + digits[7];
        
        int check1 = (sum1 * 7 - sum2) % 10;
        int check2 = (sum1 + sum2 + digits[9]) % 10;
        
        return check1 == digits[9] && check2 == digits[10];
    }
}
