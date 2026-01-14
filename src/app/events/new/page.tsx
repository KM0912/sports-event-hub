import { EventForm } from '@/components/events/EventForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '練習会を作成',
  description: '新しいバドミントン練習会を作成して、ビジターを募集しましょう。',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">練習会を作成</h1>
        <p className="text-muted mt-1">新しい練習会を作成してビジターを募集しましょう</p>
      </div>
      <EventForm mode="create" />
    </div>
  )
}
