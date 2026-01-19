'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type NavigationContextType = {
  isNavigating: boolean
  startNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetPath, setTargetPath] = useState<string | null>(null)

  const startNavigation = useCallback(() => {
    setIsNavigating(true)
    setTargetPath(pathname)
  }, [pathname])

  // パスが変わったらローディングを終了
  useEffect(() => {
    if (targetPath !== null && targetPath !== pathname) {
      // パスが実際に変わった
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setTargetPath(null)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [pathname, targetPath])

  // 同じページ内でのナビゲーション（クエリパラメータ変更など）にも対応
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setTargetPath(null)
      }, 2000) // 最大2秒でタイムアウト
      return () => clearTimeout(timer)
    }
  }, [isNavigating])

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
      {isNavigating && <NavigationOverlay />}
    </NavigationContext.Provider>
  )
}

function NavigationOverlay() {
  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* 上部プログレスバー */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-progress-indeterminate" />
      </div>
      {/* 軽い画面のオーバーレイ */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] animate-fade-in-fast" />
      {/* 中央のスピナー */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  )
}
