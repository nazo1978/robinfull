'use client';

import React from 'react';
import Link from 'next/link';
import { FiInstagram, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-base font-semibold">Robinhoot</h3>
            <p className="mt-2 text-sm text-gray-500">
              Tesla'nın minimalist tasarım anlayışını benimseyen, kullanıcı dostu bir e-ticaret platformu.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <FiFacebook size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-base font-semibold">Kategoriler</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products/electronics" className="text-sm text-gray-500 hover:text-gray-900">
                  Elektronik
                </Link>
              </li>
              <li>
                <Link href="/products/fashion" className="text-sm text-gray-500 hover:text-gray-900">
                  Moda
                </Link>
              </li>
              <li>
                <Link href="/products/home" className="text-sm text-gray-500 hover:text-gray-900">
                  Ev & Yaşam
                </Link>
              </li>
              <li>
                <Link href="/products/beauty" className="text-sm text-gray-500 hover:text-gray-900">
                  Kozmetik & Kişisel Bakım
                </Link>
              </li>
              <li>
                <Link href="/products/sports" className="text-sm text-gray-500 hover:text-gray-900">
                  Spor & Outdoor
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base font-semibold">Kurumsal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-500 hover:text-gray-900">
                  Kariyer
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-sm text-gray-500 hover:text-gray-900">
                  Basın
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base font-semibold">Yardım</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-500 hover:text-gray-900">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-500 hover:text-gray-900">
                  Kargo & Teslimat
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-gray-500 hover:text-gray-900">
                  İade & Değişim
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Robinhoot. Tüm hakları saklıdır.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center space-x-4">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Kullanım Koşulları
              </Link>
              <Link href="/cookies" className="text-sm text-gray-500 hover:text-gray-900">
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 