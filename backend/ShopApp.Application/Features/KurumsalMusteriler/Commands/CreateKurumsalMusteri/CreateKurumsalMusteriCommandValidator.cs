using FluentValidation;

namespace ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;

public class CreateKurumsalMusteriCommandValidator : AbstractValidator<CreateKurumsalMusteriCommand>
{
    public CreateKurumsalMusteriCommandValidator()
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

        // Kurumsal bilgiler validasyonu
        RuleFor(x => x.FirmaAdi)
            .NotEmpty().WithMessage("Firma adı boş olamaz.")
            .MinimumLength(2).WithMessage("Firma adı en az 2 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("Firma adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.VergiDairesi)
            .NotEmpty().WithMessage("Vergi dairesi boş olamaz.")
            .MinimumLength(2).WithMessage("Vergi dairesi en az 2 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("Vergi dairesi en fazla 100 karakter olabilir.");

        RuleFor(x => x.VergiNo)
            .NotEmpty().WithMessage("Vergi numarası boş olamaz.")
            .Matches(@"^[0-9]{10}$").WithMessage("Vergi numarası 10 haneli olmalıdır.");

        RuleFor(x => x.FaaliyetAlani)
            .NotEmpty().WithMessage("Faaliyet alanı boş olamaz.")
            .MinimumLength(2).WithMessage("Faaliyet alanı en az 2 karakter olmalıdır.")
            .MaximumLength(200).WithMessage("Faaliyet alanı en fazla 200 karakter olabilir.");

        // Yetkili kişi bilgileri validasyonu
        RuleFor(x => x.YetkiliKisiAdi)
            .NotEmpty().WithMessage("Yetkili kişi adı boş olamaz.")
            .MinimumLength(2).WithMessage("Yetkili kişi adı en az 2 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Yetkili kişi adı en fazla 50 karakter olabilir.")
            .Matches("^[a-zA-ZçğıöşüÇĞIİÖŞÜ ]+$").WithMessage("Yetkili kişi adı sadece harf ve boşluk içerebilir.");

        RuleFor(x => x.YetkiliKisiSoyadi)
            .NotEmpty().WithMessage("Yetkili kişi soyadı boş olamaz.")
            .MinimumLength(2).WithMessage("Yetkili kişi soyadı en az 2 karakter olmalıdır.")
            .MaximumLength(50).WithMessage("Yetkili kişi soyadı en fazla 50 karakter olabilir.")
            .Matches("^[a-zA-ZçğıöşüÇĞIİÖŞÜ ]+$").WithMessage("Yetkili kişi soyadı sadece harf ve boşluk içerebilir.");

        RuleFor(x => x.YetkiliKisiTelefonu)
            .NotEmpty().WithMessage("Yetkili kişi telefonu boş olamaz.")
            .Matches(@"^[0-9]{10,11}$").WithMessage("Yetkili kişi telefonu 10-11 haneli olmalıdır.");

        RuleFor(x => x.YetkiliKisiEmail)
            .NotEmpty().WithMessage("Yetkili kişi e-postası boş olamaz.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
            .MaximumLength(100).WithMessage("Yetkili kişi e-postası en fazla 100 karakter olabilir.");
    }
}
