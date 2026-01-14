import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { LEVELS, LevelKey, EVENT_STATUS } from '@/lib/constants'
import { ApplyButton } from '@/components/applications/ApplyButton'
import { Calendar, MapPin, Users, JapaneseYen, User, Clock, FileText, CheckCircle, Package, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get event with remaining spots
  const { data: event, error } = await supabase
    .from('events_with_spots')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user has already applied
  let existingApplication = null
  if (user) {
    const { data: application } = await supabase
      .from('applications')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single()
    existingApplication = application
  }

  // Check if user can apply
  let canApply = false
  if (user) {
    const { data: canApplyResult } = await supabase
      .rpc('can_apply_to_event', { event_uuid: id, user_uuid: user.id })
    canApply = canApplyResult ?? false
  }

  const isRecruiting = event.status === 'published' && (event.remaining_spots ?? 0) > 0
  const isFull = event.status === 'published' && (event.remaining_spots ?? 0) <= 0
  const isCanceled = event.status === 'canceled'
  const isHost = user?.id === event.host_user_id

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-primary">練習会一覧</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">練習会詳細</span>
      </nav>

      <article className="card animate-fade-in">
        {/* Header */}
        <header className="mb-6 pb-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={clsx('badge', {
                'badge-success': isRecruiting,
                'badge-warning': isFull,
                'badge-error': isCanceled,
              })}
            >
              {isCanceled ? EVENT_STATUS.canceled : isFull ? '満員' : EVENT_STATUS.published}
            </span>
            <span className="badge badge-primary">
              {LEVELS[event.level as LevelKey] || event.level}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 text-muted">
            <User className="w-4 h-4" />
            <span>主催: {event.host_display_name}</span>
          </div>
        </header>

        {/* Main Info Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">日時</p>
              <p className="font-medium text-gray-900">
                {format(new Date(event.start_at!), 'yyyy年M月d日(E)', { locale: ja })}
              </p>
              <p className="text-gray-700">
                {format(new Date(event.start_at!), 'HH:mm', { locale: ja })}
                {' 〜 '}
                {format(new Date(event.end_at!), 'HH:mm', { locale: ja })}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">場所</p>
              <p className="font-medium text-gray-900">{event.venue_name}</p>
              <p className="text-gray-700 text-sm">{event.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address!)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline mt-1 inline-block"
              >
                Google Mapで見る →
              </a>
            </div>
          </div>

          {/* Fee */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <JapaneseYen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">参加費</p>
              <p className="font-medium text-gray-900">{event.fee?.toLocaleString()}円</p>
            </div>
          </div>

          {/* Capacity */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted">ビジター枠</p>
              <p className="font-medium text-gray-900">
                残り{event.remaining_spots}人
                <span className="text-muted font-normal">／{event.visitor_capacity}人</span>
              </p>
            </div>
          </div>

          {/* Deadline */}
          {event.application_deadline && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted">募集締切</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(event.application_deadline), 'M月d日(E) HH:mm', { locale: ja })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            練習会について
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </section>

        {/* Participation Rules */}
        <section className="mb-6 p-4 bg-primary/5 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            参加条件
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.participation_rules}
          </p>
        </section>

        {/* Equipment */}
        {event.equipment && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              持ち物
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.equipment}
            </p>
          </section>
        )}

        {/* Notes */}
        {event.notes && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              注意事項
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.notes}
            </p>
          </section>
        )}

        {/* CTA Section */}
        <div className="mt-8 pt-6 border-t border-border">
          {isHost ? (
            <div className="flex flex-wrap gap-3">
              <Link href={`/events/${id}/edit`} className="btn btn-secondary">
                編集する
              </Link>
              <Link href={`/events/${id}/applications`} className="btn btn-primary">
                申請を管理
              </Link>
            </div>
          ) : (
            <ApplyButton
              eventId={id}
              isLoggedIn={!!user}
              canApply={canApply}
              existingApplication={existingApplication}
              isCanceled={isCanceled}
              isFull={isFull}
            />
          )}
        </div>
      </article>
    </div>
  )
}
