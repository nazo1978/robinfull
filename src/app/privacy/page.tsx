import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Link 
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-black mb-8"
      >
        <FiArrowLeft className="mr-2" /> Ana Sayfaya Dön
      </Link>
      
      <div className="flex items-center mb-8">
        <FiShield size={32} className="text-green-600 mr-3" />
        <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          Robinhoot olarak kişisel verilerinizin güvenliği bizim için çok önemlidir. Bu gizlilik politikası, 
          hizmetlerimizi kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
        </p>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Topladığımız Bilgiler</h2>
          <p>
            Sizden aşağıdaki kişisel bilgileri toplayabiliriz:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Ad, soyad, e-posta adresi, telefon numarası ve teslimat adresi gibi iletişim bilgileri</li>
            <li>Ödeme bilgileri (kredi kartı bilgileri doğrudan bizim tarafımızdan saklanmaz)</li>
            <li>Alışveriş geçmişi ve sipariş bilgileri</li>
            <li>Web sitemizi nasıl kullandığınıza dair bilgiler (çerezler aracılığıyla)</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Bilgilerinizi Nasıl Kullanıyoruz</h2>
          <p>
            Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Siparişlerinizi işlemek ve teslim etmek</li>
            <li>Hesabınızı yönetmek ve size destek sağlamak</li>
            <li>Ürünlerimiz ve hizmetlerimiz hakkında bilgi vermek</li>
            <li>Web sitemizi ve müşteri deneyimini iyileştirmek</li>
            <li>Dolandırıcılık ve diğer yasadışı faaliyetleri önlemek</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Ödeme Güvenliği</h2>
          <p>
            Robinhoot, ödeme işlemlerinizin güvenliğini sağlamak için en son güvenlik teknolojilerini kullanır:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Tüm ödeme işlemleri SSL (Secure Socket Layer) teknolojisi ile şifrelenir</li>
            <li>Kredi kartı bilgileriniz bizim sistemlerimizde saklanmaz, bunun yerine güvenli ödeme hizmet sağlayıcıları kullanılır</li>
            <li>PCI DSS (Payment Card Industry Data Security Standard) uyumlu ödeme altyapısı kullanırız</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Bilgilerinizin Paylaşılması</h2>
          <p>
            Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Siparişinizi teslim etmek için kargo şirketleriyle</li>
            <li>Ödeme işlemlerini gerçekleştirmek için ödeme hizmet sağlayıcılarıyla</li>
            <li>Yasal zorunluluk durumlarında (mahkeme kararı vb.)</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Çerezler ve Takip Teknolojileri</h2>
          <p>
            Web sitemiz, deneyiminizi iyileştirmek ve analiz amacıyla çerezler kullanır. 
            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz, ancak bu durumda 
            web sitemizin bazı özellikleri düzgün çalışmayabilir.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Haklarınız</h2>
          <p>
            Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4">
            <li>Verilerinize erişim ve düzeltme talep etme hakkı</li>
            <li>Verilerinizin silinmesini talep etme hakkı</li>
            <li>Veri işlemeye itiraz etme hakkı</li>
            <li>Veri taşınabilirliği hakkı</li>
          </ul>
          <p>
            Bu haklarınızı kullanmak için <a href="mailto:privacy@robinhoot.com" className="text-blue-600 hover:underline">privacy@robinhoot.com</a> adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Veri Saklama ve Güvenlik</h2>
          <p>
            Kişisel verilerinizi yasal yükümlülüklerimizi yerine getirmek için gerekli olan süre boyunca saklarız. 
            Verilerinizi yetkisiz erişime, değişikliğe, ifşaya veya imhaya karşı korumak için uygun teknik ve 
            organizasyonel önlemler alırız.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Değişiklikler</h2>
          <p>
            Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olması durumunda, 
            web sitemizde bir bildirim yayınlayacağız ve gerekirse size e-posta göndereceğiz.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">9. İletişim</h2>
          <p>
            Gizlilik politikamız veya kişisel verilerinizin işlenmesiyle ilgili sorularınız varsa, 
            lütfen <a href="mailto:privacy@robinhoot.com" className="text-blue-600 hover:underline">privacy@robinhoot.com</a> adresinden bizimle iletişime geçin.
          </p>
        </section>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
        </div>
      </div>
    </div>
  );
} 