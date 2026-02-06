import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { EVENT_LEVELS } from '@/constants/levels';
import { formatEventDate } from '@/lib/utils/date-utils';
import { formatCurrency, formatRemainingSlots } from '@/lib/utils/format-utils';
import type { EventWithCounts } from '@/types/event';
import type { EventLevel } from '@/types/event';

interface EventCardProps {
  event: EventWithCounts;
}

const levelColorMap: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
};

export function EventCard({ event }: EventCardProps) {
  const levelInfo = EVENT_LEVELS[event.level as EventLevel];

  return (
    <Link href={ROUTES.EVENT_DETAIL(event.id)}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {formatEventDate(event.startDatetime, event.endDatetime)}
          </p>
          <p className="text-sm">{event.venueName}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{event.municipality}</Badge>
            <Badge
              className={levelColorMap[levelInfo.color] || ''}
              variant="secondary"
            >
              {levelInfo.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{formatCurrency(event.fee)}</span>
            <span className="text-muted-foreground">
              {formatRemainingSlots(event.capacity, event.approvedCount)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            主催: {event.organizer.displayName}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
