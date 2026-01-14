'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirectTo=/profile/edit')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name)
        setOriginalName(profile.display_name)
      }
    }

    loadProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(false)

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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: trimmedName })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      setError('プロフィールの更新に失敗しました')
      setLoading(false)
      return
    }

    setOriginalName(trimmedName)
    setSuccess(true)
    setLoading(false)
    
    // Refresh to update header
    router.refresh()
  }

  const hasChanges = displayName.trim() !== originalName

  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/mypage"
        className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        マイページに戻る
      </Link>

      <div className="card animate-fade-in">
        <h1 className="text-xl font-bold text-gray-900 mb-6">プロフィール編集</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              表示名
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value)
                setSuccess(false)
              }}
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
            {success && (
              <p className="text-sm text-success mt-1">保存しました</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !hasChanges || displayName.trim().length < 2}
            className="btn btn-primary w-full"
          >
            <Save className="w-4 h-4" />
            {loading ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}
