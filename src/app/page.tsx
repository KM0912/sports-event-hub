import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { EventFilter } from '@/components/events/EventFilter'
import { Suspense } from 'react'
import { Calendar, MapPin, Users, Trophy, Search, Plus } from 'lucide-react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, parseISO } from 'date-fns'
import Link from 'next/link'

// トップページ用JSON-LD構造化データ
function WebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://miyagi-badminton.jp'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: '宮城バドミントン練習会',
        description: '宮城県のバドミントン練習会にビジターとして参加できるプラットフォーム',
        inLanguage: 'ja',
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: '宮城バドミントン練習会',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/og-image.png`,
        },
        sameAs: [],
      },
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#webpage`,
        url: baseUrl,
        name: '宮城バドミントン練習会 | ビジター募集プラットフォーム',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#organization` },
        description: '宮城県のバドミントン練習会にビジターとして参加できるプラットフォーム。初心者から上級者まで、気軽に練習会を探して参加しよう。',
        inLanguage: 'ja',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

type SearchParams = Promise<{
  date?: string
  city?: string
  level?: string
}>

async function EventList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      profiles:host_user_id(display_name)
    `)
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })

  // Apply date filter
  if (params.date) {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (params.date === 'today') {
      startDate = startOfDay(now)
      endDate = endOfDay(now)
    } else if (params.date === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 })
      endDate = endOfWeek(now, { weekStartsOn: 1 })
    } else if (params.date === 'month') {
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    } else if (params.date === 'nextMonth') {
      const nextMonth = addMonths(now, 1)
      startDate = startOfMonth(nextMonth)
      endDate = endOfMonth(nextMonth)
    } else {
      // Specific date
      startDate = startOfDay(parseISO(params.date))
      endDate = endOfDay(parseISO(params.date))
    }

    query = query
      .gte('start_at', startDate.toISOString())
      .lte('start_at', endDate.toISOString())
  }

  // Apply city filter
  if (params.city) {
    query = query.eq('city', params.city)
  }

  // Apply level filter
  if (params.level) {
    query = query.or(`level.eq.${params.level},level.eq.all`)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-error" />
        </div>
        <p className="text-gray-600 text-lg">データの読み込みに失敗しました</p>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-16 card">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary-light rounded-full flex items-center justify-center">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          練習会が見つかりませんでした
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          現在、条件に合う練習会はありません。<br />
          条件を変更して再度検索してみてください。
        </p>
        <Link href="/" className="btn btn-secondary">
          すべての練習会を見る
        </Link>
      </div>
    )
  }

  // Get approved counts for each event
  const eventsWithCounts = await Promise.all(
    events.map(async (event) => {
      const { count: approvedCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'approved')

      return {
        ...event,
        remaining_spots: event.visitor_capacity - (approvedCount ?? 0),
        host_display_name: (event.profiles as { display_name: string } | null)?.display_name ?? '主催者',
      }
    })
  )

  return (
    <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {eventsWithCounts.map((event, index) => (
        <div key={event.id} className={`animate-fade-in stagger-${Math.min(index + 1, 6)}`}>
          <EventCard
            event={{
              id: event.id,
              title: event.title,
              start_at: event.start_at,
              end_at: event.end_at,
              venue_name: event.venue_name,
              city: event.city,
              level: event.level,
              fee: event.fee,
              visitor_capacity: event.visitor_capacity,
              remaining_spots: event.remaining_spots,
              host_display_name: event.host_display_name,
              status: event.status,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default async function HomePage(props: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // ログイン済みの場合は /events/new へ、未ログインの場合は /login?redirectTo=/events/new へ
  const createEventHref = user ? '/events/new' : '/login?redirectTo=/events/new'

  return (
    <>
      <WebsiteJsonLd />
      <div className="space-y-10 md:space-y-14">
        {/* Hero Section */}
        <section className="relative py-8 md:py-12">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary-light rounded-full mb-6">
              <span className="text-2xl">🏸</span>
              <span className="font-bold text-primary text-sm">
                宮城バドミントン練習会
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="block">ビジターとして</span>
              <span className="block mt-1">
                <span className="text-primary">気軽に参加</span>
                <span>しよう</span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed px-4">
              宮城県内のバドミントン練習会を探して、
              ビジターとして気軽に参加できます。
              <span className="text-primary font-semibold">初心者から上級者まで</span>、
              あなたにぴったりの練習会が見つかります。
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
              <FeatureBadge icon={<MapPin className="w-4 h-4" />} text="宮城県全域" color="primary" />
              <FeatureBadge icon={<Users className="w-4 h-4" />} text="初心者歓迎" color="accent" />
              <FeatureBadge icon={<Trophy className="w-4 h-4" />} text="全レベル対応" color="secondary" />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#events" className="btn btn-primary text-base px-8 min-w-[200px] justify-center">
                <Search className="w-5 h-5" />
                練習会を探す
              </a>
              <Link href={createEventHref} className="btn btn-secondary text-base px-8 min-w-[200px] justify-center">
                <Plus className="w-5 h-5" />
                練習会を作る
              </Link>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section id="events" className="scroll-mt-24">
          <Suspense fallback={<FilterSkeleton />}>
            <EventFilter />
          </Suspense>
        </section>

        {/* Event List */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                開催予定の練習会
              </h2>
              <p className="text-gray-500 text-sm">
                参加したい練習会を見つけて申し込もう
              </p>
            </div>
          </div>
          <Suspense fallback={<EventListSkeleton />}>
            <EventList searchParams={props.searchParams} />
          </Suspense>
        </section>
      </div>
    </>
  )
}

// Feature badge component
function FeatureBadge({ icon, text, color }: { icon: React.ReactNode; text: string; color: 'primary' | 'secondary' | 'accent' }) {
  const colorClasses = {
    primary: 'text-primary bg-primary-light',
    secondary: 'text-secondary bg-secondary-light',
    accent: 'text-accent bg-accent-light',
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${colorClasses[color]}`}>
      {icon}
      <span className="text-sm font-semibold">{text}</span>
    </div>
  )
}

// Skeleton components
function FilterSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg w-24" />
        ))}
      </div>
    </div>
  )
}

function EventListSkeleton() {
  return (
    <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="card animate-pulse">
          <div className="h-1 bg-gray-200 rounded -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4" />
          <div className="flex items-start gap-3 mb-4">
            <div className="w-14 h-14 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-20" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded mb-4" />
          <div className="space-y-2.5">
            <div className="h-7 bg-gray-200 rounded" />
            <div className="h-7 bg-gray-200 rounded" />
            <div className="h-7 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
