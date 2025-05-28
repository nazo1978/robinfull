export interface District {
  name: string;
}

export interface City {
  name: string;
  districts: District[];
}

export const cities: City[] = [
  {
    name: "İstanbul",
    districts: [
      { name: "Adalar" },
      { name: "Arnavutköy" },
      { name: "Ataşehir" },
      { name: "Avcılar" },
      { name: "Bağcılar" },
      { name: "Bahçelievler" },
      { name: "Bakırköy" },
      { name: "Başakşehir" },
      { name: "Bayrampaşa" },
      { name: "Beşiktaş" },
      { name: "Beykoz" },
      { name: "Beylikdüzü" },
      { name: "Beyoğlu" },
      { name: "Büyükçekmece" },
      { name: "Çatalca" },
      { name: "Çekmeköy" },
      { name: "Esenler" },
      { name: "Esenyurt" },
      { name: "Eyüpsultan" },
      { name: "Fatih" },
      { name: "Gaziosmanpaşa" },
      { name: "Güngören" },
      { name: "Kadıköy" },
      { name: "Kağıthane" },
      { name: "Kartal" },
      { name: "Küçükçekmece" },
      { name: "Maltepe" },
      { name: "Pendik" },
      { name: "Sancaktepe" },
      { name: "Sarıyer" },
      { name: "Silivri" },
      { name: "Sultanbeyli" },
      { name: "Sultangazi" },
      { name: "Şile" },
      { name: "Şişli" },
      { name: "Tuzla" },
      { name: "Ümraniye" },
      { name: "Üsküdar" },
      { name: "Zeytinburnu" }
    ]
  },
  {
    name: "Ankara",
    districts: [
      { name: "Akyurt" },
      { name: "Altındağ" },
      { name: "Ayaş" },
      { name: "Bala" },
      { name: "Beypazarı" },
      { name: "Çamlıdere" },
      { name: "Çankaya" },
      { name: "Çubuk" },
      { name: "Elmadağ" },
      { name: "Etimesgut" },
      { name: "Evren" },
      { name: "Gölbaşı" },
      { name: "Güdül" },
      { name: "Haymana" },
      { name: "Kalecik" },
      { name: "Kazan" },
      { name: "Keçiören" },
      { name: "Kızılcahamam" },
      { name: "Mamak" },
      { name: "Nallıhan" },
      { name: "Polatlı" },
      { name: "Pursaklar" },
      { name: "Sincan" },
      { name: "Şereflikoçhisar" },
      { name: "Yenimahalle" }
    ]
  },
  {
    name: "İzmir",
    districts: [
      { name: "Aliağa" },
      { name: "Balçova" },
      { name: "Bayındır" },
      { name: "Bayraklı" },
      { name: "Bergama" },
      { name: "Beydağ" },
      { name: "Bornova" },
      { name: "Buca" },
      { name: "Çeşme" },
      { name: "Çiğli" },
      { name: "Dikili" },
      { name: "Foça" },
      { name: "Gaziemir" },
      { name: "Güzelbahçe" },
      { name: "Karabağlar" },
      { name: "Karaburun" },
      { name: "Karşıyaka" },
      { name: "Kemalpaşa" },
      { name: "Kınık" },
      { name: "Kiraz" },
      { name: "Konak" },
      { name: "Menderes" },
      { name: "Menemen" },
      { name: "Narlıdere" },
      { name: "Ödemiş" },
      { name: "Seferihisar" },
      { name: "Selçuk" },
      { name: "Tire" },
      { name: "Torbalı" },
      { name: "Urla" }
    ]
  },
  {
    name: "Bursa",
    districts: [
      { name: "Büyükorhan" },
      { name: "Gemlik" },
      { name: "Gürsu" },
      { name: "Harmancık" },
      { name: "İnegöl" },
      { name: "İznik" },
      { name: "Karacabey" },
      { name: "Keles" },
      { name: "Kestel" },
      { name: "Mudanya" },
      { name: "Mustafakemalpaşa" },
      { name: "Nilüfer" },
      { name: "Orhaneli" },
      { name: "Orhangazi" },
      { name: "Osmangazi" },
      { name: "Yenişehir" },
      { name: "Yıldırım" }
    ]
  },
  {
    name: "Antalya",
    districts: [
      { name: "Akseki" },
      { name: "Aksu" },
      { name: "Alanya" },
      { name: "Demre" },
      { name: "Döşemealtı" },
      { name: "Elmalı" },
      { name: "Finike" },
      { name: "Gazipaşa" },
      { name: "Gündoğmuş" },
      { name: "İbradı" },
      { name: "Kaş" },
      { name: "Kemer" },
      { name: "Kepez" },
      { name: "Konyaaltı" },
      { name: "Korkuteli" },
      { name: "Kumluca" },
      { name: "Manavgat" },
      { name: "Muratpaşa" },
      { name: "Serik" }
    ]
  },
  {
    name: "Adana",
    districts: [
      { name: "Aladağ" },
      { name: "Ceyhan" },
      { name: "Çukurova" },
      { name: "Feke" },
      { name: "İmamoğlu" },
      { name: "Karaisalı" },
      { name: "Karataş" },
      { name: "Kozan" },
      { name: "Pozantı" },
      { name: "Saimbeyli" },
      { name: "Sarıçam" },
      { name: "Seyhan" },
      { name: "Tufanbeyli" },
      { name: "Yumurtalık" },
      { name: "Yüreğir" }
    ]
  }
];

export const companyTypes = [
  "Anonim Sirket",
  "Limited Sirket",
  "Kollektif Sirket",
  "Komandit Sirket",
  "Kooperatif",
  "Sahis Sirketi",
  "Diger"
];

export const productCategories = [
  "Elektronik",
  "Giyim",
  "Ev & Yasam",
  "Spor & Outdoor",
  "Kitap & Muzik",
  "Oyuncak",
  "Kozmetik",
  "Otomotiv",
  "Bahce & Yapi Market",
  "Diger"
];
