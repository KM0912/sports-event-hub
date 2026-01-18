'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getPendingApplicationsCount,
  getUnreadChatsCount,
} from '@/actions/notifications'

type NotificationBadgeProps = {
  type: 'pending-applications' | 'unread-chats'
  userId: string
}

export function NotificationBadge({ type, userId }: NotificationBadgeProps) {
  const [count, setCount] = useState<number>(0)
  const supabase = createClient()

  const fetchCount = useCallback(async () => {
    if (type === 'pending-applications') {
      const result = await getPendingApplicationsCount()
      setCount(result)
    } else {
      const result = await getUnreadChatsCount()
      setCount(result)
    }
  }, [type])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  // Realtime subscriptions
  useEffect(() => {
    if (type === 'pending-applications') {
      // 申請テーブルの変更を監視
      const channel = supabase
        .channel(`applications-badge-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'applications',
          },
          () => {
            fetchCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      // メッセージと既読テーブルの変更を監視
      const messagesChannel = supabase
        .channel(`messages-badge-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          () => {
            fetchCount()
          }
        )
        .subscribe()

      const readsChannel = supabase
        .channel(`reads-badge-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversation_reads',
          },
          () => {
            fetchCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(messagesChannel)
        supabase.removeChannel(readsChannel)
      }
    }
  }, [type, userId, supabase, fetchCount])

  if (count === 0) {
    return null
  }

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-bold text-white bg-red-500 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  )
}

// ハンバーガーメニュー用: 通知があるかどうかを示すドット
type NotificationDotProps = {
  userId: string
}

export function NotificationDot({ userId }: NotificationDotProps) {
  const [hasNotification, setHasNotification] = useState(false)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    const [pendingCount, unreadCount] = await Promise.all([
      getPendingApplicationsCount(),
      getUnreadChatsCount(),
    ])
    setHasNotification(pendingCount > 0 || unreadCount > 0)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscriptions
  useEffect(() => {
    const applicationsChannel = supabase
      .channel(`applications-dot-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    const messagesChannel = supabase
      .channel(`messages-dot-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    const readsChannel = supabase
      .channel(`reads-dot-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_reads',
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(applicationsChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(readsChannel)
    }
  }, [userId, supabase, fetchNotifications])

  if (!hasNotification) {
    return null
  }

  return (
    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
  )
}
