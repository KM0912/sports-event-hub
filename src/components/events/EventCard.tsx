import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { LEVELS, LevelKey, EVENT_STATUS } from '@/lib/constants'
import { Calendar, MapPin, Users, JapaneseYen, User } from 'lucide-react'
import clsx from 'clsx'

type EventCardProps = {
  event: {
    id: string
    title: string
    start_at: string
    end_at: string
    venue_name: string
    city: string
    level: string
    fee: number
    visitor_capacity: number
    remaining_spots: number
    host_display_name: string
    status: string
  }
}

export function EventCard({ event }: EventCardProps) {
  const isRecruiting = event.status === 'published' && event.remaining_spots > 0
  const isFull = event.status === 'published' && event.remaining_spots <= 0
  const isCanceled = event.status === 'canceled'

  return (
    <Link
      href={`/events/${event.id}`}
      className={clsx(
        'card group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 block',
        isCanceled && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
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

          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {format(new Date(event.start_at), 'M月d日(E) HH:mm', { locale: ja })}
                {' 〜 '}
                {format(new Date(event.end_at), 'HH:mm', { locale: ja })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{event.venue_name}（{event.city}）</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <JapaneseYen className="w-4 h-4 text-primary" />
                <span>{event.fee.toLocaleString()}円</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  残り{event.remaining_spots}枠
                  <span className="text-xs text-muted-foreground">／{event.visitor_capacity}人</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted">
        <User className="w-4 h-4" />
        <span>主催: {event.host_display_name}</span>
      </div>
    </Link>
  )
}
