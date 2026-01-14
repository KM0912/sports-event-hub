import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { APPLICATION_STATUS, LEVELS, LevelKey } from '@/lib/constants'
import { Calendar, MapPin, Clock, CheckCircle, XCircle, MessageCircle, User, Settings } from 'lucide-react'
import clsx from 'clsx'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マイページ',
  description: '申請状況の確認、参加予定の練習会、参加履歴を確認できます。',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function MyPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirectTo=/mypage')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  // Get user's applications with event details
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      events(
        id,
        title,
        start_at,
        end_at,
        venue_name,
        city,
        level,
        status,
        chat_expires_at,
        host_user_id,
        profiles:host_user_id(display_name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()
  
  // Separate applications by status
  const pendingApps = applications?.filter(a => a.status === 'pending') || []
  const approvedUpcoming = applications?.filter(
    a => a.status === 'approved' && a.events && new Date(a.events.start_at) >= now
  ) || []
  const approvedPast = applications?.filter(
    a => a.status === 'approved' && a.events && new Date(a.events.start_at) < now
  ) || []
  const rejectedApps = applications?.filter(a => a.status === 'rejected') || []
  const canceledApps = applications?.filter(a => a.status === 'canceled') || []

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.display_name || 'ユーザー'}
              </h1>
              <p className="text-muted">マイページ</p>
            </div>
          </div>
          <Link href="/profile/edit" className="btn btn-ghost">
            <Settings className="w-4 h-4" />
            編集
          </Link>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApps.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            申請中
            <span className="badge badge-warning">{pendingApps.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                type="pending"
              />
            ))}
          </div>
        </section>
      )}

      {/* Approved Upcoming */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          参加予定
          {approvedUpcoming.length > 0 && (
            <span className="badge badge-success">{approvedUpcoming.length}</span>
          )}
        </h2>
        {approvedUpcoming.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              参加予定の練習会はありません
            </h3>
            <p className="text-muted mb-4">
              練習会を探して参加してみましょう
            </p>
            <Link href="/" className="btn btn-primary inline-flex">
              練習会を探す
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {approvedUpcoming.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                type="approved"
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {approvedPast.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted" />
            参加履歴
          </h2>
          <div className="space-y-3">
            {approvedPast.slice(0, 5).map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                type="past"
              />
            ))}
          </div>
        </section>
      )}

      {/* Rejected Applications */}
      {rejectedApps.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-muted" />
            不参加
          </h2>
          <div className="space-y-3">
            {rejectedApps.map((app) => (
              <div key={app.id} className="card opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">{app.events?.title}</h3>
                    <p className="text-sm text-muted mt-1">
                      今回は条件に合わなかったため参加いただけませんでした
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

type ApplicationCardProps = {
  application: {
    id: string
    status: string
    events: {
      id: string
      title: string
      start_at: string
      end_at: string
      venue_name: string
      city: string
      level: string
      status: string
      chat_expires_at: string
      host_user_id: string
      profiles: { display_name: string } | null
    } | null
  }
  type: 'pending' | 'approved' | 'past'
}

function ApplicationCard({ application, type }: ApplicationCardProps) {
  const event = application.events
  if (!event) return null

  const isCanceled = event.status === 'canceled'
  const canChat = type === 'approved' && new Date() <= new Date(event.chat_expires_at)

  return (
    <div className={clsx('card', type === 'past' && 'opacity-70')}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCanceled && (
              <span className="badge badge-error">中止</span>
            )}
            <span className="badge badge-primary">
              {LEVELS[event.level as LevelKey]}
            </span>
            {type === 'pending' && (
              <span className="badge badge-warning">承認待ち</span>
            )}
          </div>
          <Link
            href={`/events/${event.id}`}
            className="font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            {event.title}
          </Link>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(event.start_at), 'M/d(E) HH:mm', { locale: ja })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.venue_name}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {event.profiles?.display_name || '主催者'}
            </div>
          </div>
        </div>
        
        {type === 'approved' && !isCanceled && (
          <div className="flex gap-2">
            {canChat && (
              <Link
                href={`/events/${event.id}/chat`}
                className="btn btn-secondary text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                連絡する
              </Link>
            )}
          </div>
        )}

        {type === 'pending' && (
          <Link
            href={`/events/${event.id}`}
            className="btn btn-ghost text-sm"
          >
            詳細を見る
          </Link>
        )}
      </div>
    </div>
  )
}
