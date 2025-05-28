'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiChevronDown, FiFilter } from 'react-icons/fi'
import Countdown from '@/components/Countdown'
import SafeImage from '@/components/SafeImage'

interface Auction {
  _id: string
  productId: {
    _id: string
    name: string
    images: string[]
    category: string
  }
  startPrice: number
  currentPrice: number
  startTime: string
  endTime: string
  status: string
  bids: any[]
}

export default function AuctionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tümü")
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("endingSoon")
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [categories, setCategories] = useState<string[]>(["Tümü"])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/auctions?status=active')
        if (!response.ok) throw new Error('Açık artırmalar yüklenirken bir hata oluştu')
        const data = await response.json()
        setAuctions(data.auctions || [])

        // Kategorileri çek
        const uniqueCategories = new Set<string>(["Tümü"])
        data.auctions.forEach((auction: Auction) => {
          if (auction.productId?.category) {
            uniqueCategories.add(auction.productId.category)
          }
        })
        setCategories(Array.from(uniqueCategories))
      } catch (err) {
        console.error('Açık artırma verileri çekilirken hata:', err)
        setError('Açık artırmalar yüklenirken bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuctions()
  }, [])

  useEffect(() => {
    if (auctions.length === 0) return

    let filtered = [...auctions]
    if (selectedCategory !== "Tümü") {
      filtered = filtered.filter(auction =>
        auction.productId?.category === selectedCategory
      )
    }

    // Sıralama
    switch (sortBy) {
      case "endingSoon":
        filtered.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
        break
      case "highestBid":
        filtered.sort((a, b) => b.currentPrice - a.currentPrice)
        break
      case "mostBids":
        filtered.sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0))
        break
    }

    setAuctions(filtered)
  }, [selectedCategory, sortBy])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 auto-text">Açık Artırmalar</h1>
          <p className="text-gray-600 dark:text-gray-400">Özel ve nadir bulunan ürünleri açık artırma ile satın alın</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center">
          <div className="mr-4">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value="endingSoon">Yakında Bitecek</option>
              <option value="highestBid">En Yüksek Teklif</option>
              <option value="mostBids">En Çok Teklif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        {/* Filtreler */}
        <div className="md:col-span-3">
          <div className="auto-card rounded-lg">
            <div
              className="flex justify-between items-center mb-4 md:mb-6 cursor-pointer md:cursor-default"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <h2 className="text-xl font-semibold flex items-center">
                <FiFilter className="mr-2" /> Filtreler
              </h2>
              <FiChevronDown className="md:hidden" />
            </div>

            <div className={`${filterOpen ? 'block' : 'hidden'} md:block`}>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Kategoriler</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <button
                        className={`w-full text-left py-1 px-2 rounded ${
                          selectedCategory === category
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Açık Artırma Listesi */}
        <div className="md:col-span-9">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-xl text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-black text-white dark:bg-white dark:text-black py-2 px-6 rounded-full"
              >
                Yeniden Dene
              </button>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl">Bu filtrelerle eşleşen açık artırma bulunamadı.</p>
              <button
                onClick={() => setSelectedCategory("Tümü")}
                className="mt-4 bg-black text-white dark:bg-white dark:text-black py-2 px-6 rounded-full"
              >
                Tüm açık artırmaları göster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <div key={auction._id} className="auto-card rounded-lg overflow-hidden transition-transform hover:scale-[1.02]">
                  <div className="relative h-48 mb-4">
                    <SafeImage
                      src={auction.productId.images}
                      alt={auction.productId.name}
                      fill
                      className="object-cover"
                      fallbackText="Resim yok"
                    />
                  </div>
                  <div className="p-4">
                    <Link href={`/auctions/${auction._id}`}>
                      <h3 className="text-lg font-semibold mb-2 hover:underline">{auction.productId.name}</h3>
                    </Link>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Güncel teklif:</span>
                        <span className="font-bold">{auction.currentPrice.toLocaleString()} ₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Başlangıç:</span>
                        <span>{auction.startPrice.toLocaleString()} ₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Teklif sayısı:</span>
                        <span>{auction.bids?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Kalan süre:</span>
                        <span className="text-red-600">
                          <Countdown targetDate={new Date(auction.endTime)} compact={true} />
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/auctions/${auction._id}`}
                      className="block primary-btn text-center mt-4"
                    >
                      Teklif Ver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}