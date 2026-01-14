'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, X } from 'lucide-react'

type CancelEventButtonProps = {
  eventId: string
}

export function CancelEventButton({ eventId }: CancelEventButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    setLoading(true)

    const { error } = await supabase
      .from('events')
      .update({ status: 'canceled' })
      .eq('id', eventId)

    if (error) {
      console.error('Cancel error:', error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn btn-ghost text-error hover:bg-error/10"
      >
        <X className="w-4 h-4" />
        練習会を中止する
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  練習会を中止しますか？
                </h3>
                <p className="text-muted mt-1">
                  中止すると、新規の参加申請を受け付けなくなります。
                  既存の申請者には「中止」と表示されます。
                  この操作は取り消せません。
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-ghost"
              >
                キャンセル
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? '処理中...' : '中止する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
