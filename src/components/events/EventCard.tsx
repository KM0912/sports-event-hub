import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import { LEVELS, LevelKey, EVENT_STATUS } from "@/lib/constants";
import { MapPin, Users, JapaneseYen, User, Clock } from "lucide-react";
import clsx from "clsx";

type EventCardProps = {
  event: {
    id: string;
    title: string;
    start_at: string;
    end_at: string;
    venue_name: string;
    city: string;
    level: string;
    fee: number;
    visitor_capacity: number;
    remaining_spots: number;
    host_display_name: string;
    status: string;
  };
};

export function EventCard({ event }: EventCardProps) {
  const isRecruiting =
    event.status === "published" && event.remaining_spots > 0;
  const isFull = event.status === "published" && event.remaining_spots <= 0;
  const isCanceled = event.status === "canceled";
  const isLowSpots = isRecruiting && event.remaining_spots <= 3;

  // Format date
  const dateStr = formatInTimeZone(
    new Date(event.start_at),
    "Asia/Tokyo",
    "M/d",
    { locale: ja }
  );
  const dayStr = formatInTimeZone(
    new Date(event.start_at),
    "Asia/Tokyo",
    "E",
    { locale: ja }
  );
  const timeStr = formatInTimeZone(
    new Date(event.start_at),
    "Asia/Tokyo",
    "HH:mm",
    { locale: ja }
  );
  const endTimeStr = formatInTimeZone(
    new Date(event.end_at),
    "Asia/Tokyo",
    "HH:mm",
    { locale: ja }
  );

  return (
    <Link
      href={`/events/${event.id}`}
      className={clsx(
        "group block card hover:shadow-lg transition-all duration-300",
        "hover:border-primary",
        isCanceled && "opacity-60"
      )}
    >
      {/* Top accent bar */}
      <div
        className={clsx(
          "h-1 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 mb-4 rounded-t-xl",
          isLowSpots
            ? "bg-gradient-to-r from-secondary to-warning"
            : isRecruiting
            ? "bg-gradient-to-r from-primary to-accent"
            : isFull
            ? "bg-muted"
            : "bg-error"
        )}
      />

      {/* Header: Date & Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Date display */}
          <div className="flex flex-col items-center justify-center w-14 h-14 bg-primary rounded-lg text-white">
            <span className="text-xl font-bold leading-none">{dateStr}</span>
            <span className="text-xs font-medium opacity-90">{dayStr}</span>
          </div>

          {/* Status badges */}
          <div className="flex flex-col gap-1.5">
            <span
              className={clsx("badge", {
                "badge-success": isRecruiting && !isLowSpots,
                "badge-warning": isLowSpots || isFull,
                "badge-error": isCanceled,
              })}
            >
              {isCanceled
                ? EVENT_STATUS.canceled
                : isFull
                ? "満員"
                : isLowSpots
                ? "残りわずか"
                : EVENT_STATUS.published}
            </span>
            <span className="badge badge-primary">
              {LEVELS[event.level as LevelKey] || event.level}
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-snug">
        {event.title}
      </h3>

      {/* Event details */}
      <div className="space-y-2 text-sm text-gray-600">
        {/* Time */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{timeStr} - {endTimeStr}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate flex-1">
            {event.venue_name}
            <span className="text-gray-400 ml-1">({event.city})</span>
          </span>
        </div>

        {/* Fee */}
        <div className="flex items-center gap-2">
          <JapaneseYen className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            ¥{event.fee.toLocaleString()}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>
            残り
            <span className={clsx(
              "font-semibold mx-0.5",
              isLowSpots ? "text-secondary" : "text-primary"
            )}>
              {event.remaining_spots}
            </span>
            / {event.visitor_capacity}名
          </span>
        </div>
      </div>

      {/* Host info */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
        <User className="w-4 h-4 text-gray-400" />
        <span>主催: {event.host_display_name}</span>
      </div>
    </Link>
  );
}
