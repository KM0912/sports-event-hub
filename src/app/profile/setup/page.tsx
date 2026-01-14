'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

function ProfileSetupForm() {
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        router.push(redirectTo)
        return
      }

      // Pre-fill display name from user metadata (for email signup)
      if (user.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name)
      }
    }

    getUser()
  }, [supabase, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    const trimmedName = displayName.trim()
    if (trimmedName.length < 2) {
      setError('表示名は2文字以上で入力してください')
      setLoading(false)
      return
    }

    if (trimmedName.length > 20) {
      setError('表示名は20文字以内で入力してください')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: trimmedName,
      })

    if (insertError) {
      console.error('Profile creation error:', insertError)
      setError('プロフィールの作成に失敗しました')
      setLoading(false)
      return
    }

    router.push(redirectTo)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ようこそ！
          </h1>
          <p className="text-muted">
            表示名を設定してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              表示名
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例：田中太郎"
              className={`input ${error ? 'input-error' : ''}`}
              maxLength={20}
              required
            />
            <p className="text-xs text-muted mt-1">
              この名前が他のユーザーに表示されます（2〜20文字）
            </p>
            {error && (
              <p className="text-sm text-error mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || displayName.trim().length < 2}
            className="btn btn-primary w-full"
          >
            {loading ? '設定中...' : '始める'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><p>読み込み中...</p></div>}>
      <ProfileSetupForm />
    </Suspense>
  )
}
