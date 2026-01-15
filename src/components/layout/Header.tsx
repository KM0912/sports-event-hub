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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <>
            <div 
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 top-16"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="md:hidden py-4 border-t border-border animate-slide-in bg-white relative z-50">
              <nav className="flex flex-col gap-1">
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
                    <div className="px-4 py-3 border-t border-border mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-muted">
                          {displayName || 'ユーザー'}
                        </span>
                        <button
                          onClick={handleSignOut}
                          className="text-sm md:text-base text-error font-medium min-h-[44px] px-2"
                        >
                          ログアウト
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="btn btn-primary mx-4 mt-2 min-h-[48px] text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                )}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
