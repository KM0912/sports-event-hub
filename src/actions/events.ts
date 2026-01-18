'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserEmail, getUserEmails } from '@/lib/supabase/admin'
import { sendBatchEmails } from '@/lib/email/send-email'
import { EventCanceled } from '@/lib/email/templates/EventCanceled'
import { formatInTimeZone } from 'date-fns-tz'
import { ja } from 'date-fns/locale'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// 日時をフォーマット
function formatEventDate(startAt: string, endAt: string): string {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const dateStr = formatInTimeZone(start, 'Asia/Tokyo', 'yyyy年M月d日(E)', { locale: ja })
  const startTime = formatInTimeZone(start, 'Asia/Tokyo', 'HH:mm', { locale: ja })
  const endTime = formatInTimeZone(end, 'Asia/Tokyo', 'HH:mm', { locale: ja })
  return `${dateStr} ${startTime}〜${endTime}`
}

// イベントを中止
export async function cancelEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // イベント情報を取得
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select(`
      id,
      title,
      start_at,
      end_at,
      host_user_id,
      profiles:host_user_id (
        display_name
      )
    `)
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return { success: false, error: 'Event not found' }
  }

  // ホストのみが中止可能
  if (event.host_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // 承認済みの参加者を取得
  const { data: approvedApplications } = await supabase
    .from('applications')
    .select(`
      user_id,
      profiles (
        display_name
      )
    `)
    .eq('event_id', eventId)
    .eq('status', 'approved')

  // イベントを中止
  const { error: updateError } = await supabase
    .from('events')
    .update({ status: 'canceled' })
    .eq('id', eventId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 承認済み参加者全員にメールを送信
  if (approvedApplications && approvedApplications.length > 0) {
    const userIds = approvedApplications.map(app => app.user_id)
    const emailMap = await getUserEmails(userIds)

    const hostName = (event.profiles as { display_name: string } | null)?.display_name || '主催者'
    const eventDate = formatEventDate(event.start_at, event.end_at)

    const emails = approvedApplications
      .filter(app => emailMap.has(app.user_id))
      .map(app => ({
        to: emailMap.get(app.user_id)!,
        subject: `【重要】${event.title}が中止になりました`,
        react: EventCanceled({
          participantName: app.profiles?.display_name || 'ゲスト',
          eventTitle: event.title,
          eventDate,
          hostName,
          homeUrl: baseUrl,
        }),
      }))

    if (emails.length > 0) {
      await sendBatchEmails({ emails })
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
