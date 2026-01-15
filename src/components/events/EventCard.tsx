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
  const isLowSpots = isRecruiting && event.remaining_spots <= 3

  return (
    <Link
      href={`/events/${event.id}`}
      className={clsx(
        'card group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 block p-4 md:p-6',
        isCanceled && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
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
            {isLowSpots && (
              <span className="badge badge-warning animate-pulse-soft">
                残りわずか
              </span>
            )}
          </div>

          <h3 className="font-semibold text-base md:text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-4">
            {event.title}
          </h3>

          <div className="space-y-2.5 text-sm md:text-base">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-gray-700">
                {format(new Date(event.start_at), 'M月d日(E) HH:mm', { locale: ja })}
                {' 〜 '}
                {format(new Date(event.end_at), 'HH:mm', { locale: ja })}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-gray-700 truncate">{event.venue_name}（{event.city}）</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <JapaneseYen className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-700 font-medium">{event.fee.toLocaleString()}円</span>
              </div>
              <div className={clsx(
                'flex items-center gap-2',
                isLowSpots && 'text-warning font-semibold'
              )}>
                <Users className={clsx(
                  'w-5 h-5 flex-shrink-0',
                  isLowSpots ? 'text-warning' : 'text-primary'
                )} />
                <span>
                  残り<strong className="text-base">{event.remaining_spots}</strong>枠
                  <span className="text-xs text-muted ml-1">／{event.visitor_capacity}人</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted">
        <User className="w-4 h-4 flex-shrink-0" />
        <span>主催: {event.host_display_name}</span>
      </div>
    </Link>
  )
}
