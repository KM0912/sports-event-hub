import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { EventFilter } from '@/components/events/EventFilter'
import { Suspense } from 'react'
import { Calendar, Sparkles } from 'lucide-react'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns'

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
      <div className="text-center py-12">
        <p className="text-muted">イベントの取得に失敗しました</p>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 card">
        <Calendar className="w-12 h-12 mx-auto text-muted mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          練習会が見つかりませんでした
        </h3>
        <p className="text-muted">
          条件を変更して再度検索してみてください
        </p>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {eventsWithCounts.map((event, index) => (
        <div key={event.id} className={`animate-fade-in stagger-${Math.min(index + 1, 5)}`}>
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
  return (
    <>
      <WebsiteJsonLd />
      <div>
      {/* Hero Section */}
      <section className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
          <Sparkles className="w-4 h-4" />
          宮城県のバドミントン練習会
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          ビジターとして
          <span className="text-primary">気軽に参加</span>
          しよう
        </h1>
        <p className="text-muted max-w-2xl mx-auto">
          宮城県内のバドミントン練習会を探して、ビジターとして参加できます。
          <br className="hidden md:block" />
          初心者から上級者まで、あなたにぴったりの練習会がきっと見つかります。
        </p>
      </section>

      {/* Filter Section */}
      <Suspense fallback={<div className="card animate-pulse h-32" />}>
        <EventFilter />
      </Suspense>

      {/* Event List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            開催予定の練習会
          </h2>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse h-64" />
              ))}
            </div>
          }
        >
          <EventList searchParams={props.searchParams} />
        </Suspense>
      </section>
    </div>
    </>
  )
}
