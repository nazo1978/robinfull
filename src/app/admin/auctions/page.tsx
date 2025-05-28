'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layouts/AdminLayout'
import AuctionManagement from '@/components/admin/AuctionManagement'

export default function AdminAuctionsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Admin kontrolü
    const checkAdmin = () => {
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        router.push('/admin/login')
        return
      }

      try {
        const admin = JSON.parse(adminData)
        if (admin && admin.role === 'admin') {
          setIsAdmin(true)
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Admin verisi parse edilemedi:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!isAdmin) {
    return null // Router zaten login sayfasına yönlendirdi
  }

  return (
    <AdminLayout>
      <AuctionManagement />
    </AdminLayout>
  )
}
