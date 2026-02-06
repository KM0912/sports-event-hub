import { EventCard } from './event-card';
import type { EventWithCounts } from '@/types/event';

interface EventListProps {
  events: EventWithCounts[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>条件に合うイベントが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
