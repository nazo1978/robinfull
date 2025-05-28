using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class BireyselMusteri : Musteri
{
    public string TCKN { get; set; }
    public DateTime DogumTarihi { get; set; }
    public string Cinsiyet { get; set; }
    public string MedeniDurum { get; set; }
    public string MeslekBilgisi { get; set; }
} 