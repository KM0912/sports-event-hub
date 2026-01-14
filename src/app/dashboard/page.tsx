import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { EVENT_STATUS, LEVELS, LevelKey } from '@/lib/constants'
import { Plus, Calendar, MapPin, Users, Clock, Edit, Eye, UserCheck, XCircle } from 'lucide-react'
import clsx from 'clsx'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '主催者ダッシュボード',
  description: '練習会の作成・管理、参加申請の確認ができる主催者専用ページ。',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirectTo=/dashboard')
  }

  // Get user's events with pending application count
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      applications(count)
    `)
    .eq('host_user_id', user.id)
    .order('start_at', { ascending: false })

  // Get pending applications count for each event
  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event) => {
      const { count: pendingCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'pending')

      const { count: approvedCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'approved')

      return {
        ...event,
        pendingCount: pendingCount ?? 0,
        approvedCount: approvedCount ?? 0,
        remainingSpots: event.visitor_capacity - (approvedCount ?? 0),
      }
    })
  )

  const upcomingEvents = eventsWithCounts.filter(
    e => new Date(e.start_at) >= new Date() && e.status !== 'canceled'
  )
  const pastEvents = eventsWithCounts.filter(
    e => new Date(e.start_at) < new Date() || e.status === 'canceled'
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">主催者ダッシュボード</h1>
          <p className="text-muted mt-1">練習会の管理・参加申請の確認</p>
        </div>
        <Link href="/events/new" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          練習会を作成
        </Link>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          開催予定の練習会
          {upcomingEvents.length > 0 && (
            <span className="badge badge-primary">{upcomingEvents.length}</span>
          )}
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              開催予定の練習会はありません
            </h3>
            <p className="text-muted mb-4">
              新しい練習会を作成してビジターを募集しましょう
            </p>
            <Link href="/events/new" className="btn btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              練習会を作成
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={event.id}
                className={`card animate-fade-in stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('badge', {
                        'badge-success': event.remainingSpots > 0,
                        'badge-warning': event.remainingSpots <= 0,
                      })}>
                        {event.remainingSpots > 0 ? EVENT_STATUS.published : '満員'}
                      </span>
                      <span className="badge badge-primary">
                        {LEVELS[event.level as LevelKey]}
                      </span>
                      {event.pendingCount > 0 && (
                        <span className="badge badge-warning animate-pulse-soft">
                          {event.pendingCount}件の申請待ち
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(event.start_at), 'M/d(E) HH:mm', { locale: ja })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.venue_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.approvedCount}/{event.visitor_capacity}人
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="btn btn-ghost text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      詳細
                    </Link>
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="btn btn-ghost text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      編集
                    </Link>
                    <Link
                      href={`/events/${event.id}/applications`}
                      className={clsx(
                        'btn text-sm',
                        event.pendingCount > 0 ? 'btn-primary' : 'btn-secondary'
                      )}
                    >
                      <UserCheck className="w-4 h-4" />
                      申請管理
                      {event.pendingCount > 0 && (
                        <span className="ml-1">({event.pendingCount})</span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted" />
            過去の練習会
          </h2>
          <div className="space-y-3">
            {pastEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="card opacity-70">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {event.status === 'canceled' ? (
                        <span className="badge badge-error">中止</span>
                      ) : (
                        <span className="badge badge-muted">終了</span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-700">{event.title}</h3>
                    <p className="text-sm text-muted">
                      {format(new Date(event.start_at), 'yyyy/M/d(E)', { locale: ja })}
                      {' · '}
                      参加者{event.approvedCount}人
                    </p>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="btn btn-ghost text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
