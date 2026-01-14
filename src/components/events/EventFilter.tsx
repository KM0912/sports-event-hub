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
          className="btn btn-secondary w-full"
        >
          <Filter className="w-4 h-4" />
          フィルター
          {hasFilters && (
            <span className="ml-2 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="card mt-4 md:mt-0">
          <div className="flex flex-wrap gap-4">
            {/* Date Quick Filters */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日付
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {quickDateFilters.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setDateFilter(dateFilter === value ? '' : value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      dateFilter === value
                        ? 'bg-primary text-white'
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
                className="input"
                placeholder="日付を選択"
              />
            </div>

            {/* City Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                市区町村
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="input"
              >
                <option value="">すべて</option>
                {MIYAGI_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レベル
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="input"
              >
                <option value="">すべて</option>
                {Object.entries(LEVELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-ghost text-sm"
              >
                <X className="w-4 h-4" />
                クリア
              </button>
            )}
            <button
              onClick={applyFilters}
              className="btn btn-primary text-sm"
            >
              <Search className="w-4 h-4" />
              検索
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
