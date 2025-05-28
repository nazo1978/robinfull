using System;
using ShopApp.Core.Common;

namespace ShopApp.Domain.Entities;

public class KurumsalMusteri : Musteri
{
    public string FirmaAdi { get; set; }
    public string VergiDairesi { get; set; }
    public string VergiNo { get; set; }
    public string FaaliyetAlani { get; set; }
    public string YetkiliKisiAdi { get; set; }
    public string YetkiliKisiSoyadi { get; set; }
    public string YetkiliKisiTelefonu { get; set; }
    public string YetkiliKisiEmail { get; set; }
} 