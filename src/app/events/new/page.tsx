import { EventForm } from '@/components/events/EventForm'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LevelKey } from '@/lib/constants'

export const metadata: Metadata = {
  title: '練習会を作成',
  description: '新しいバドミントン練習会を作成して、ビジターを募集しましょう。',
  robots: {
    index: false,
    follow: false,
  },
}

type SearchParams = Promise<{ copy?: string }>

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { copy: copyEventId } = await searchParams
  let initialData = undefined

  if (copyEventId) {
    const supabase = await createClient()
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', copyEventId)
      .single()

    if (event) {
      // コピー時は日時をクリア（新しく設定する必要があるため）
      initialData = {
        title: event.title,
        start_at: '',
        end_at: '',
        venue_name: event.venue_name,
        address: event.address,
        city: event.city,
        level: event.level as LevelKey,
        level_notes: event.level_notes || '',
        fee: event.fee,
        visitor_capacity: event.visitor_capacity,
        description: event.description,
        participation_rules: event.participation_rules,
        equipment: event.equipment || '',
        notes: event.notes || '',
        application_deadline: '',
        deadline_hours_before: '',
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">練習会を作成</h1>
        <p className="text-muted mt-1">
          {initialData
            ? '過去の練習会をコピーしました。日時を設定してください'
            : '新しい練習会を作成してビジターを募集しましょう'}
        </p>
      </div>
      <EventForm mode="create" initialData={initialData} />
    </div>
  )
}
