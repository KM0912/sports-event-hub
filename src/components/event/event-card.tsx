import Link from 'next/link';
import { Calendar, MapPin, Users, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function EventCard({ event }: EventCardProps) {
  const levelInfo = EVENT_LEVELS[event.level as EventLevel];
  const remaining = event.capacity - event.approvedCount;
  const isFull = remaining <= 0;

  return (
    <Link href={ROUTES.EVENT_DETAIL(event.id)} className="group block">
      <Card className="relative overflow-hidden border-border/60 py-0 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary/5">
        {/* レベルカラーバー */}
        <div
          className={`h-1 w-full ${
            levelInfo.color === 'green'
              ? 'bg-emerald-500'
              : levelInfo.color === 'blue'
                ? 'bg-blue-500'
                : levelInfo.color === 'yellow'
                  ? 'bg-amber-500'
                  : levelInfo.color === 'red'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
          }`}
        />
        <CardContent className="p-4">
          {/* タイトル */}
          <h3 className="mb-3 line-clamp-2 text-base font-bold leading-snug tracking-tight group-hover:text-primary">
            {event.title}
          </h3>

          {/* 情報グリッド */}
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">
                {formatEventDate(event.startDatetime, event.endDatetime)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{event.venueName}</span>
            </div>
          </div>

          {/* バッジ */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="border-border/80 text-xs font-normal"
            >
              {event.municipality}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${levelColorMap[levelInfo.color] || ''}`}
            >
              {levelInfo.label}
            </Badge>
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              {formatCurrency(event.fee)}
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                isFull
                  ? 'text-destructive'
                  : remaining <= 2
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {isFull
                ? '満員'
                : formatRemainingSlots(event.capacity, event.approvedCount)}
            </div>
          </div>

          {/* 主催者 */}
          <p className="mt-2 text-xs text-muted-foreground/70">
            主催: {event.organizer.displayName}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
