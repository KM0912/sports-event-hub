import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EventForm } from '@/components/events/EventForm'
import { CancelEventButton } from '@/components/events/CancelEventButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirectTo=/events/${id}/edit`)
  }

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('host_user_id', user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  const initialData = {
    id: event.id,
    title: event.title,
    start_at: event.start_at,
    end_at: event.end_at,
    venue_name: event.venue_name,
    address: event.address,
    city: event.city,
    level: event.level as 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'all',
    fee: event.fee,
    visitor_capacity: event.visitor_capacity,
    description: event.description,
    participation_rules: event.participation_rules,
    equipment: event.equipment || '',
    notes: event.notes || '',
    application_deadline: event.application_deadline || '',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">練習会を編集</h1>
        <p className="text-muted mt-1">練習会の情報を変更できます</p>
      </div>

      <EventForm mode="edit" initialData={initialData} />

      {/* Cancel Event */}
      {event.status !== 'canceled' && (
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">危険な操作</h2>
          <CancelEventButton eventId={id} />
        </div>
      )}
    </div>
  )
}
