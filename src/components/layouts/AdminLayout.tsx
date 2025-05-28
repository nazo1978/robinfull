'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiBox, FiTag, FiUsers, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    // Admin bilgilerini localStorage'dan al
    const adminData = localStorage.getItem('admin')
    if (adminData) {
      try {
        const admin = JSON.parse(adminData)
        setAdminName(admin.name || admin.email || 'Admin')
      } catch (error) {
        console.error('Admin verisi parse edilemedi:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('user')
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    window.location.href = '/'
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <FiHome size={20} /> },
    { name: 'Ürünler', href: '/admin/products', icon: <FiBox size={20} /> },
    { name: 'Açık Artırmalar', href: '/admin/auctions', icon: <FiTag size={20} /> },
    { name: 'Kullanıcılar', href: '/admin/users', icon: <FiUsers size={20} /> },
    { name: 'Ayarlar', href: '/admin/settings', icon: <FiSettings size={20} /> },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobil menü butonu */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-black dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hoş geldiniz, {adminName}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiLogOut className="mr-3" size={20} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ana içerik */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <main className="p-4 md:p-8 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
