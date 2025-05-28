using System;
using System.Collections.Generic;
using ShopApp.Core.Identity;

namespace ShopApp.Domain.Entities;

public abstract class Musteri : ApplicationUser
{
    public string Ad { get; set; }
    public string Soyad { get; set; }
    public string Telefon { get; set; }
    public string Adres { get; set; }
    public DateTime KayitTarihi { get; set; }
    public bool AktifMi { get; set; }

    public Musteri()
    {
        KayitTarihi = DateTime.UtcNow;
        AktifMi = true;

        // ApplicationUser'dan gelen alanları eşleştir
        FirstName = Ad;
        LastName = Soyad;
        PhoneNumber = Telefon;
        Address = Adres;
        RegistrationDate = KayitTarihi;
        IsActive = AktifMi;
    }
}