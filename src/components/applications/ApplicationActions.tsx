'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Ban, MoreVertical } from 'lucide-react'
import clsx from 'clsx'

type ApplicationActionsProps = {
  applicationId: string
  userId: string
  isBlocked: boolean
  remainingSpots: number
}

export function ApplicationActions({
  applicationId,
  userId,
  isBlocked,
  remainingSpots,
}: ApplicationActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    if (remainingSpots <= 0) return
    setLoading(true)

    const { error } = await supabase
      .from('applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)

    if (error) {
      console.error('Approve error:', error)
    }

    setLoading(false)
    router.refresh()
  }

  const handleReject = async () => {
    setLoading(true)

    const { error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)

    if (error) {
      console.error('Reject error:', error)
    }

    setLoading(false)
    setShowMenu(false)
    router.refresh()
  }

  const handleBlock = async () => {
    setLoading(true)

    // Reject the application
    await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)

    // Block the user
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('host_blocks').insert({
        host_user_id: user.id,
        blocked_user_id: userId,
      })
    }

    setLoading(false)
    setShowBlockConfirm(false)
    setShowMenu(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading || remainingSpots <= 0}
        className={clsx(
          'btn btn-primary text-sm',
          (loading || remainingSpots <= 0) && 'opacity-50 cursor-not-allowed'
        )}
        title={remainingSpots <= 0 ? '枠がありません' : '承認'}
      >
        <Check className="w-4 h-4" />
        承認
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="btn btn-ghost text-sm text-muted hover:text-error hover:bg-error/10"
      >
        <X className="w-4 h-4" />
        却下
      </button>

      {/* More Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-muted-bg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-muted" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-border z-20 py-1">
              {!isBlocked && (
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowBlockConfirm(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  参加制限に追加
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              参加制限に追加
            </h3>
            <p className="text-muted mb-4">
              このユーザーを参加制限に追加すると、今後あなたの練習会に申請できなくなります。
              この操作は相手には通知されません。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="btn btn-ghost"
              >
                キャンセル
              </button>
              <button
                onClick={handleBlock}
                disabled={loading}
                className="btn btn-danger"
              >
                <Ban className="w-4 h-4" />
                {loading ? '処理中...' : '追加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
