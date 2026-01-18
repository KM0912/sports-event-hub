'use client'

import { useState, useTransition } from 'react'
import { cancelEvent } from '@/actions/events'
import { AlertTriangle, X } from 'lucide-react'

type CancelEventButtonProps = {
  eventId: string
}

export function CancelEventButton({ eventId }: CancelEventButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelEvent(eventId)
      if (result?.error) {
        console.error('Cancel error:', result.error)
      }
      // cancelEvent handles redirect to dashboard
    })
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
                  <strong className="text-gray-900">承認済みの参加者全員にメールで通知されます。</strong>
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
                disabled={isPending}
                className="btn btn-danger"
              >
                {isPending ? '処理中...' : '中止する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
