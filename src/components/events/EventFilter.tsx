'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LEVELS, MIYAGI_CITIES, LevelKey } from '@/lib/constants'
import { Filter, X, Search, Calendar, MapPin, Trophy, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export function EventFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '')
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '')
  const [levelFilter, setLevelFilter] = useState(searchParams.get('level') || '')
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters = dateFilter || cityFilter || levelFilter
  const filterCount = [dateFilter, cityFilter, levelFilter].filter(Boolean).length

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
    { label: '来週', value: 'nextWeek' },
    { label: '今月', value: 'month' },
    { label: '来月', value: 'nextMonth' },
  ]

  return (
    <div className="mb-8">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "w-full py-3.5 px-5 font-semibold text-base transition-all duration-200 min-h-[52px] rounded-xl",
            "flex items-center justify-between",
            hasFilters
              ? "bg-primary text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-primary"
          )}
        >
          <span className="flex items-center gap-2.5">
            <Filter className="w-5 h-5" />
            絞り込み検索
          </span>
          <span className="flex items-center gap-2">
            {hasFilters && (
              <span className="w-6 h-6 bg-white/20 text-sm font-bold rounded-full flex items-center justify-center">
                {filterCount}
              </span>
            )}
            <ChevronDown className={clsx(
              "w-5 h-5 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className={clsx(
        "transition-all duration-300 overflow-hidden md:overflow-visible",
        isOpen ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 md:max-h-none md:opacity-100 md:mt-0"
      )}>
        <div className="card">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">練習会を探す</h3>
              <p className="text-sm text-gray-500">条件を指定して絞り込み</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Date Quick Filters */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
                <Calendar className="w-4 h-4 text-primary" />
                日付
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickDateFilters.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setDateFilter(dateFilter === value ? '' : value)}
                    className={clsx(
                      "px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[40px] rounded-lg",
                      dateFilter === value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={dateFilter && !['today', 'week', 'nextWeek', 'month', 'nextMonth'].includes(dateFilter) ? dateFilter : ''}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input min-h-[44px] text-base w-full"
                placeholder="日付を選択"
              />
            </div>

            {/* City and Level Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  場所
                </label>
                <div className="relative">
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className={clsx(
                      "input min-h-[44px] text-base w-full pr-10 appearance-none cursor-pointer",
                      cityFilter && "border-accent"
                    )}
                  >
                    <option value="">すべての市区町村</option>
                    {MIYAGI_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
                  <Trophy className="w-4 h-4 text-secondary" />
                  レベル
                </label>
                <div className="relative">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className={clsx(
                      "input min-h-[44px] text-base w-full pr-10 appearance-none cursor-pointer",
                      levelFilter && "border-secondary"
                    )}
                  >
                    <option value="">すべてのレベル</option>
                    {Object.entries(LEVELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
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
              className="btn btn-primary text-base min-h-[44px] order-1 sm:order-2 px-8"
            >
              <Search className="w-5 h-5" />
              検索する
            </button>
          </div>
        </div>
      </div>

      {/* Active filters display (mobile) */}
      {hasFilters && !isOpen && (
        <div className="md:hidden mt-3 flex flex-wrap gap-2">
          {dateFilter && (
            <FilterTag
              label={quickDateFilters.find(f => f.value === dateFilter)?.label || dateFilter}
              onRemove={() => {
                setDateFilter('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('date')
                router.push(`/?${params.toString()}`)
              }}
            />
          )}
          {cityFilter && (
            <FilterTag
              label={cityFilter}
              onRemove={() => {
                setCityFilter('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('city')
                router.push(`/?${params.toString()}`)
              }}
            />
          )}
          {levelFilter && (
            <FilterTag
              label={LEVELS[levelFilter as LevelKey]}
              onRemove={() => {
                setLevelFilter('')
                const params = new URLSearchParams(searchParams.toString())
                params.delete('level')
                router.push(`/?${params.toString()}`)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary text-sm font-medium rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="w-4 h-4 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
