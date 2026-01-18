'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserEmail } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/send-email'
import { ApplicationApproved } from '@/lib/email/templates/ApplicationApproved'
import { ApplicationRejected } from '@/lib/email/templates/ApplicationRejected'
import { NewApplication } from '@/lib/email/templates/NewApplication'
import { ParticipantCanceled } from '@/lib/email/templates/ParticipantCanceled'
import { formatInTimeZone } from 'date-fns-tz'
import { ja } from 'date-fns/locale'
import { revalidatePath } from 'next/cache'

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

// 申請を承認
export async function approveApplication(applicationId: string) {
  const supabase = await createClient()

  // 現在のユーザーを確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 申請とイベント情報を取得
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select(`
      *,
      events (
        id,
        title,
        start_at,
        end_at,
        venue_name,
        address,
        host_user_id
      ),
      profiles (
        display_name
      )
    `)
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) {
    return { success: false, error: 'Application not found' }
  }

  // ホストのみが承認可能
  if (application.events.host_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // ステータスを更新
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', applicationId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 申請者にメールを送信
  const applicantEmail = await getUserEmail(application.user_id)
  if (applicantEmail) {
    await sendEmail({
      to: applicantEmail,
      subject: `【参加承認】${application.events.title}への参加が承認されました`,
      react: ApplicationApproved({
        applicantName: application.profiles?.display_name || 'ゲスト',
        eventTitle: application.events.title,
        eventDate: formatEventDate(application.events.start_at, application.events.end_at),
        eventLocation: `${application.events.venue_name}（${application.events.address}）`,
        eventUrl: `${baseUrl}/events/${application.events.id}`,
        chatUrl: `${baseUrl}/events/${application.events.id}/chat`,
      }),
    })
  }

  revalidatePath(`/events/${application.events.id}/applications`)
  return { success: true }
}

// 申請を却下
export async function rejectApplication(applicationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 申請とイベント情報を取得
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select(`
      *,
      events (
        id,
        title,
        start_at,
        end_at,
        host_user_id
      ),
      profiles (
        display_name
      )
    `)
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) {
    return { success: false, error: 'Application not found' }
  }

  if (application.events.host_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 申請者にメールを送信
  const applicantEmail = await getUserEmail(application.user_id)
  if (applicantEmail) {
    await sendEmail({
      to: applicantEmail,
      subject: `【申請結果】${application.events.title}への参加申請について`,
      react: ApplicationRejected({
        applicantName: application.profiles?.display_name || 'ゲスト',
        eventTitle: application.events.title,
        eventDate: formatEventDate(application.events.start_at, application.events.end_at),
        homeUrl: baseUrl,
      }),
    })
  }

  revalidatePath(`/events/${application.events.id}/applications`)
  return { success: true }
}

// 申請を却下してブロック
export async function rejectAndBlockUser(applicationId: string, blockedUserId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 申請情報を取得してホストを確認
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('events (id, host_user_id)')
    .eq('id', applicationId)
    .single()

  if (fetchError || !application || application.events.host_user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // 申請を却下
  await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  // ユーザーをブロック
  await supabase.from('host_blocks').insert({
    host_user_id: user.id,
    blocked_user_id: blockedUserId,
  })

  revalidatePath(`/events/${application.events.id}/applications`)
  return { success: true }
}

// 参加申請を作成
export async function createApplication(eventId: string, comment: string | null) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // ユーザーのプロフィールを取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

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

  // 申請を作成
  const { error: insertError } = await supabase.from('applications').insert({
    event_id: eventId,
    user_id: user.id,
    comment: comment?.trim() || null,
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  // ホストにメールを送信
  const hostEmail = await getUserEmail(event.host_user_id)
  if (hostEmail) {
    await sendEmail({
      to: hostEmail,
      subject: `【新規申請】${profile?.display_name || 'ゲスト'}さんから参加申請があります`,
      react: NewApplication({
        hostName: (event.profiles as { display_name: string } | null)?.display_name || '主催者',
        applicantName: profile?.display_name || 'ゲスト',
        eventTitle: event.title,
        eventDate: formatEventDate(event.start_at, event.end_at),
        comment: comment?.trim() || null,
        applicationsUrl: `${baseUrl}/events/${eventId}/applications`,
      }),
    })
  }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

// 申請をキャンセル（参加者側からのキャンセル）
export async function cancelApplication(applicationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 申請情報を取得
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select(`
      *,
      events (
        id,
        title,
        start_at,
        end_at,
        host_user_id,
        profiles:host_user_id (
          display_name
        )
      ),
      profiles (
        display_name
      )
    `)
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) {
    return { success: false, error: 'Application not found' }
  }

  // 自分の申請のみキャンセル可能
  if (application.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const wasApproved = application.status === 'approved'

  // ステータスを更新
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'canceled' })
    .eq('id', applicationId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // 承認済みの場合のみホストに通知
  if (wasApproved) {
    const hostEmail = await getUserEmail(application.events.host_user_id)
    if (hostEmail) {
      await sendEmail({
        to: hostEmail,
        subject: `【キャンセル】${application.profiles?.display_name || 'ゲスト'}さんが参加をキャンセルしました`,
        react: ParticipantCanceled({
          hostName: (application.events.profiles as { display_name: string } | null)?.display_name || '主催者',
          participantName: application.profiles?.display_name || 'ゲスト',
          eventTitle: application.events.title,
          eventDate: formatEventDate(application.events.start_at, application.events.end_at),
          applicationsUrl: `${baseUrl}/events/${application.events.id}/applications`,
        }),
      })
    }
  }

  revalidatePath(`/events/${application.events.id}`)
  return { success: true }
}
