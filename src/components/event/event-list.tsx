import { CalendarX } from 'lucide-react';
import { EventCard } from './event-card';
import type { EventWithCounts } from '@/types/event';

interface EventListProps {
  events: EventWithCounts[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <CalendarX className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <p className="text-base font-medium text-muted-foreground">
          条件に合う練習会が見つかりませんでした
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          フィルターの条件を変更して再検索してみてください
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
