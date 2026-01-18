'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Menu, X, User as UserIcon, LogOut, Calendar, LayoutDashboard, ChevronRight } from 'lucide-react'
import { NotificationBadge, NotificationDot } from './NotificationBadge'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white shadow-md'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        {/* Accent line */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-xl">🏸</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-gray-900 leading-tight">
                  宮城バドミントン
                </h1>
                <p className="text-xs text-primary font-medium -mt-0.5">
                  練習会プラットフォーム
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/">
                <Calendar className="w-4 h-4" />
                練習会を探す
              </NavLink>
              {user && (
                <>
                  <NavLink
                    href="/dashboard"
                    badge={<NotificationBadge type="pending-applications" userId={user.id} />}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    主催者ダッシュボード
                  </NavLink>
                  <NavLink
                    href="/mypage"
                    badge={<NotificationBadge type="unread-chats" userId={user.id} />}
                  >
                    <UserIcon className="w-4 h-4" />
                    マイページ
                  </NavLink>
                </>
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {displayName || 'ユーザー'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost text-sm py-2"
                  >
                    <LogOut className="w-4 h-4" />
                    ログアウト
                  </button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:flex btn btn-primary text-sm py-2">
                  ログイン
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden relative p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="メニューを開く"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
                {user && !isMenuOpen && <NotificationDot userId={user.id} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white shadow-xl z-[70] transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏸</span>
            <span className="font-semibold text-gray-900">メニュー</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="メニューを閉じる"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Drawer Content */}
        <nav className="flex flex-col p-3 gap-1 h-[calc(100%-5rem)] overflow-y-auto">
          <MobileNavLink
            href="/"
            icon={<Calendar className="w-5 h-5" />}
            onClick={() => setIsMenuOpen(false)}
          >
            練習会を探す
          </MobileNavLink>

          {user ? (
            <>
              <MobileNavLink
                href="/dashboard"
                icon={<LayoutDashboard className="w-5 h-5" />}
                badge={<NotificationBadge type="pending-applications" userId={user.id} />}
                onClick={() => setIsMenuOpen(false)}
              >
                主催者ダッシュボード
              </MobileNavLink>
              <MobileNavLink
                href="/mypage"
                icon={<UserIcon className="w-5 h-5" />}
                badge={<NotificationBadge type="unread-chats" userId={user.id} />}
                onClick={() => setIsMenuOpen(false)}
              >
                マイページ
              </MobileNavLink>

              {/* User Section */}
              <div className="mt-auto pt-4 border-t border-gray-100 mt-4">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {displayName || 'ユーザー'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <div className="mt-auto pt-4">
              <Link
                href="/login"
                className="btn btn-primary w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                ログイン
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  )
}

function NavLink({
  href,
  children,
  badge,
}: {
  href: string
  children: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
    >
      {children}
      {badge}
    </Link>
  )
}

function MobileNavLink({
  href,
  children,
  icon,
  badge,
  onClick,
}: {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px] text-sm font-medium group"
      onClick={onClick}
    >
      <span className="flex items-center gap-3">
        <span className="relative text-primary">
          {icon}
          {badge}
        </span>
        {children}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
    </Link>
  )
}
