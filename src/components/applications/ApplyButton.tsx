'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createApplication, cancelApplication } from '@/actions/applications'
import { Send, Check, X, Clock, AlertCircle, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { NavigationLink } from '@/components/navigation/NavigationLink'

type ApplyButtonProps = {
  eventId: string
  isLoggedIn: boolean
  canApply: boolean
  existingApplication: {
    id: string
    status: string
  } | null
  isCanceled: boolean
  isFull: boolean
}

export function ApplyButton({
  eventId,
  isLoggedIn,
  canApply,
  existingApplication,
  isCanceled,
  isFull,
}: ApplyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleApply = () => {
    if (!agreedToRules) return

    startTransition(async () => {
      const result = await createApplication(eventId, comment.trim() || null)
      if (result.error) {
        console.error('Application error:', result.error)
        return
      }

      setIsModalOpen(false)
      router.refresh()
    })
  }

  const handleCancel = () => {
    if (!existingApplication) return

    startTransition(async () => {
      const result = await cancelApplication(existingApplication.id)
      if (result.error) {
        console.error('Cancel error:', result.error)
        return
      }

      router.refresh()
    })
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <NavigationLink
        href={`/login?redirectTo=/events/${eventId}`}
        className="btn btn-primary w-full md:w-auto text-base min-h-[48px] md:min-h-[44px]"
      >
        <Send className="w-5 h-5 md:w-4 md:h-4" />
        ログインして参加申請
      </NavigationLink>
    )
  }

  // Event canceled
  if (isCanceled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-error/10 rounded-lg">
        <AlertCircle className="w-5 h-5 text-error" />
        <span className="text-error font-medium">この練習会は中止になりました</span>
      </div>
    )
  }

  // Already applied
  if (existingApplication) {
    const status = existingApplication.status

    if (status === 'pending') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-primary">申請中</p>
              <p className="text-sm text-muted">承認をお待ちください</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="btn btn-ghost text-error hover:bg-error/10 text-base min-h-[44px]"
          >
            <X className="w-5 h-5 md:w-4 md:h-4" />
            {isPending ? '処理中...' : '申請をキャンセル'}
          </button>
        </div>
      )
    }

    if (status === 'approved') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
            <Check className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium text-success">参加が承認されました</p>
              <p className="text-sm text-muted">当日お待ちしています！</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <NavigationLink
              href={`/events/${eventId}/chat`}
              className="btn btn-secondary text-base min-h-[44px]"
            >
              <MessageCircle className="w-5 h-5 md:w-4 md:h-4" />
              主催者に連絡
            </NavigationLink>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="btn btn-ghost text-error hover:bg-error/10 text-base min-h-[44px]"
            >
              <X className="w-5 h-5 md:w-4 md:h-4" />
              {isPending ? '処理中...' : '参加をキャンセル'}
            </button>
          </div>
        </div>
      )
    }

    if (status === 'rejected') {
      return (
        <div className="flex items-center gap-3 p-4 bg-muted-bg rounded-lg">
          <X className="w-5 h-5 text-muted" />
          <div>
            <p className="font-medium text-gray-700">今回は条件に合わなかったため参加いただけませんでした</p>
          </div>
        </div>
      )
    }

    if (status === 'canceled') {
      return (
        <div className="flex items-center gap-3 p-4 bg-muted-bg rounded-lg">
          <X className="w-5 h-5 text-muted" />
          <span className="text-muted">キャンセル済み</span>
        </div>
      )
    }
  }

  // Full
  if (isFull) {
    return (
      <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg">
        <AlertCircle className="w-5 h-5 text-warning" />
        <span className="text-warning font-medium">現在満員です</span>
      </div>
    )
  }

  // Cannot apply (blocked or other reason)
  if (!canApply) {
    return (
      <button disabled className="btn btn-primary opacity-50 cursor-not-allowed w-full md:w-auto">
        <Send className="w-4 h-4" />
        参加申請
      </button>
    )
  }

  // Can apply
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn btn-primary w-full md:w-auto text-base min-h-[48px] md:min-h-[44px]"
      >
        <Send className="w-5 h-5 md:w-4 md:h-4" />
        参加申請する
      </button>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">参加申請</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-muted-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  ひとこと（任意）
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="自己紹介や意気込みなど"
                  className="input resize-none"
                />
                <p className="text-xs text-muted text-right mt-1">{comment.length}/200</p>
              </div>

              <label className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  参加条件を確認し、同意しました
                </span>
              </label>

              <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost flex-1 text-base min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                onClick={handleApply}
                disabled={!agreedToRules || isPending}
                className={clsx(
                  'btn btn-primary flex-1 text-base min-h-[44px]',
                  (!agreedToRules || isPending) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Send className="w-5 h-5 md:w-4 md:h-4" />
                {isPending ? '送信中...' : '申請する'}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
