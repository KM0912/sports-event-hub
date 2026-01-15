'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageTransitionLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // パス変更時にローディングを開始
    setIsLoading(true)
    setProgress(0)

    // プログレスバーのアニメーション
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90 // 90%で止める（実際のロード完了を待つ）
        }
        return prev + 10
      })
    }, 50)

    // 少し遅延を入れてローディングを完了させる（実際のページロードをシミュレート）
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-300 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)',
        }}
      />
    </div>
  )
}
