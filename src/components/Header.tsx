'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiShoppingCart, FiMenu, FiSearch, FiShield, FiLogOut, FiPackage } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import Cart from './Cart';
import { useAuth } from '@/shared/context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Site ayarları
  const [sectionVisibility, setSectionVisibility] = React.useState({
    featuredProducts: true,
    dynamicBanners: true,
    dynamicPricing: true,
    lotterySection: true,
    exchangeSection: true,
    auctionSection: true,
    categories: true
  });

  // Search dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  // Site ayarlarını getir
  useEffect(() => {
    const fetchSectionVisibility = async () => {
      try {
        const response = await fetch('/api/site-settings/sections');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.sections) {
            setSectionVisibility(data.sections);
          }
        }
      } catch (err) {
        console.error('Site ayarları yüklenirken hata:', err);
      }
    };

    fetchSectionVisibility();
  }, []);

  // AuthContext'ten user bilgisi alınıyor, ek kontrol gerekmiyor

  const handleLogout = async () => {
    try {
      // Backend logout API'sini çağır
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Logout API hatası
    }

    // AuthContext'ten logout fonksiyonunu kullan
    logout();
    router.push('/');
  };

  const handleUserClick = () => {
    if (user) {
      // Kullanıcı giriş yapmışsa rolüne göre yönlendir
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'seller') {
        router.push('/seller/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Giriş yapmamışsa login sayfasına yönlendir
      router.push('/auth/login');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Search açıldığında input'a focus ver
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/Goo_(search_engine)_logo_2020.svg (1).png"
              alt="RobinHoot Logo"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              RobinHoot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
              Ürünler
            </Link>
            {sectionVisibility.auctionSection && (
              <Link href="/auctions" className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
                Açık Artırma
              </Link>
            )}
            {sectionVisibility.exchangeSection && (
              <Link href="/exchange" className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
                Takas
              </Link>
            )}
            {sectionVisibility.lotterySection && (
              <Link href="/lotteries" className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
                Çekilişler
              </Link>
            )}
          </nav>

          {/* Search, Cart, User, Theme */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={searchRef}>
              <button
                onClick={toggleSearch}
                className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
                title="Arama"
              >
                <FiSearch size={24} />
              </button>

              {/* Search Dropdown */}
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <form onSubmit={handleSearch} className="p-4">
                    <div className="relative">
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ürün ara..."
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <FiSearch size={20} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <Cart />

            {/* Birleşik Kullanıcı/Admin Butonu */}
            {!isLoading && (
              <div className="flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleUserClick}
                      className="flex items-center space-x-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    >
                      {user.role === 'admin' ? <FiShield size={20} /> :
                       user.role === 'seller' ? <FiPackage size={20} /> : <FiUser size={20} />}
                      <span className="hidden sm:inline text-sm">
                        {user.username || user.name || user.email}
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                      title="Çıkış Yap"
                    >
                      <FiLogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleUserClick}
                    className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    title="Giriş Yap"
                  >
                    <FiUser size={24} />
                  </button>
                )}
              </div>
            )}

            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FiMenu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ürünler
              </Link>
              {sectionVisibility.auctionSection && (
                <Link
                  href="/auctions"
                  className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Açık Artırma
                </Link>
              )}
              {sectionVisibility.exchangeSection && (
                <Link
                  href="/exchange"
                  className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Takas
                </Link>
              )}
              {sectionVisibility.lotterySection && (
                <Link
                  href="/lotteries"
                  className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Çekilişler
                </Link>
              )}

              {/* Mobile User/Admin Section */}
              {user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleUserClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-left"
                  >
                    {user.role === 'admin' ? <FiShield size={20} /> :
                     user.role === 'seller' ? <FiPackage size={20} /> : <FiUser size={20} />}
                    <span>{user.username || user.name || user.email}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-left"
                  >
                    <FiLogOut size={20} />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleUserClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-left pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <FiUser size={20} />
                  <span>Giriş Yap</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;