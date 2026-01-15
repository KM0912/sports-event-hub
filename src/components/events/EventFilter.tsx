'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LEVELS, MIYAGI_CITIES, LevelKey } from '@/lib/constants'
import { Filter, X, Search } from 'lucide-react'

export function EventFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '')
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '')
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') || '')
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters = dateFilter || cityFilter || levelFilter

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (dateFilter) params.set('date', dateFilter)
    if (cityFilter) params.set('city', cityFilter)
    if (levelFilter) params.set('level', levelFilter)
    router.push(`/?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setDateFilter('')
    setCityFilter('')
    setLevelFilter('')
    router.push('/')
    setIsOpen(false)
  }

  const quickDateFilters = [
    { label: '今日', value: 'today' },
    { label: '今週', value: 'week' },
    { label: '今月', value: 'month' },
  ]

  return (
    <div className="mb-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary w-full py-3 min-h-[44px]"
        >
          <Filter className="w-5 h-5" />
          フィルター
          {hasFilters && (
            <span className="ml-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {[dateFilter, cityFilter, levelFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="card mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
            {/* Date Quick Filters */}
            <div className="flex-1 min-w-full md:min-w-[200px]">
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                日付
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickDateFilters.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setDateFilter(dateFilter === value ? '' : value)}
                    className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-colors min-h-[44px] ${
                      dateFilter === value
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-muted-bg text-muted hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={dateFilter && !['today', 'week', 'month'].includes(dateFilter) ? dateFilter : ''}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input min-h-[44px] text-base"
                placeholder="日付を選択"
              />
            </div>

            {/* City Filter */}
            <div className="flex-1 min-w-full md:min-w-[200px]">
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                市区町村
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="input min-h-[44px] text-base"
              >
                <option value="">すべて</option>
                {MIYAGI_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex-1 min-w-full md:min-w-[200px]">
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                レベル
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="input min-h-[44px] text-base"
              >
                <option value="">すべて</option>
                {Object.entries(LEVELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-4 border-t border-border">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-ghost text-base min-h-[44px] order-2 sm:order-1"
              >
                <X className="w-5 h-5" />
                クリア
              </button>
            )}
            <button
              onClick={applyFilters}
              className="btn btn-primary text-base min-h-[44px] order-1 sm:order-2 flex-1 sm:flex-initial"
            >
              <Search className="w-5 h-5" />
              検索
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
