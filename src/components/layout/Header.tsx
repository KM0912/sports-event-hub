'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Menu, X, User as UserIcon, LogOut, Calendar, LayoutDashboard } from 'lucide-react'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()
        setDisplayName(profile?.display_name ?? null)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setDisplayName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-xl">🏸</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-gray-900 leading-tight">
                  宮城バドミントン
                </h1>
                <p className="text-xs text-muted -mt-0.5">練習会プラットフォーム</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-muted-bg hover:text-primary transition-colors font-medium text-sm lg:text-base"
              >
                練習会を探す
              </Link>
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-muted-bg hover:text-primary transition-colors font-medium text-sm lg:text-base"
                  >
                    主催者ダッシュボード
                  </Link>
                  <Link
                    href="/mypage"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-muted-bg hover:text-primary transition-colors font-medium text-sm lg:text-base"
                  >
                    マイページ
                  </Link>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted-bg rounded-full">
                    <UserIcon className="w-4 h-4 text-muted" />
                    <span className="text-sm lg:text-base font-medium text-gray-700">
                      {displayName || 'ユーザー'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost text-sm lg:text-base"
                  >
                    <LogOut className="w-4 h-4" />
                    ログアウト
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:block btn btn-primary text-sm lg:text-base">
                  ログイン
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 rounded-lg hover:bg-muted-bg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="メニューを開く"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer - Outside header to avoid backdrop-blur inheritance */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div 
        className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border bg-white">
          <span className="font-semibold text-gray-900">メニュー</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted-bg transition-colors"
            aria-label="メニューを閉じる"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <nav className="flex flex-col p-4 gap-1 bg-white h-[calc(100%-4rem)]">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-gray-700 hover:bg-muted-bg transition-colors min-h-[44px] text-base"
            onClick={() => setIsMenuOpen(false)}
          >
            <Calendar className="w-5 h-5 text-primary" />
            練習会を探す
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-gray-700 hover:bg-muted-bg transition-colors min-h-[44px] text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 text-primary" />
                主催者ダッシュボード
              </Link>
              <Link
                href="/mypage"
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-gray-700 hover:bg-muted-bg transition-colors min-h-[44px] text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserIcon className="w-5 h-5 text-primary" />
                マイページ
              </Link>
              
              {/* User Section */}
              <div className="mt-auto pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-3 px-4 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-muted" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {displayName || 'ユーザー'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-error hover:bg-red-50 transition-colors min-h-[44px] text-base w-full"
                >
                  <LogOut className="w-5 h-5" />
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary mt-4 min-h-[48px] text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </>
  )
}
