import { notFound } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Coins,
  Users,
  User,
  Clock,
  ClipboardList,
  Backpack,
  FileText,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { getEventById } from '@/actions/event-actions';
import { getAuthUser } from '@/actions/auth-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EVENT_LEVELS } from '@/constants/levels';
import { formatEventDate, formatDate } from '@/lib/utils/date-utils';
import { formatCurrency, formatRemainingSlots } from '@/lib/utils/format-utils';
import { ApplicationButton } from '@/components/application/application-button';
import type { EventLevel } from '@/types/event';
import type { Metadata } from 'next';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventById(id);
  if (!result.success) return {};

  const event = result.data;
  return {
    title: event.title,
    description: `${formatEventDate(event.startDatetime, event.endDatetime)} @ ${event.venueName}`,
    openGraph: {
      title: event.title,
      description: `${formatEventDate(event.startDatetime, event.endDatetime)} @ ${event.venueName}`,
    },
  };
}

const levelColorMap: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const result = await getEventById(id);
  if (!result.success) notFound();

  const event = result.data;
  const user = await getAuthUser();
  const levelInfo = EVENT_LEVELS[event.level as EventLevel];
  const remaining = event.capacity - event.approvedCount;
  const isFull = remaining <= 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    startDate: event.startDatetime,
    endDate: event.endDatetime,
    location: {
      '@type': 'Place',
      name: event.venueName,
      address: event.venueAddress,
    },
    organizer: {
      '@type': 'Person',
      name: event.organizer.displayName,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* ステータスバナー */}
          {event.status === 'cancelled' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              このイベントはキャンセルされました
            </div>
          )}

          <Card className="overflow-hidden border-border/60 shadow-lg">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-primary/8 to-primary/3 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="border-border/60 bg-card/80 text-xs font-normal"
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
              <h1 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                {event.title}
              </h1>
            </div>

            <CardContent className="space-y-5 p-4 sm:p-6">
              {/* 基本情報グリッド */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      日時
                    </p>
                    <p className="text-sm font-semibold leading-snug">
                      {formatEventDate(event.startDatetime, event.endDatetime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      会場
                    </p>
                    <p className="text-sm font-semibold">{event.venueName}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.venueAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* 参加費・枠 */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-2.5">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">参加費</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(event.fee)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users
                    className={`h-5 w-5 ${isFull ? 'text-destructive' : 'text-primary'}`}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">残り枠</p>
                    <p
                      className={`text-lg font-bold ${isFull ? 'text-destructive' : ''}`}
                    >
                      {isFull
                        ? '満員'
                        : formatRemainingSlots(
                            event.capacity,
                            event.approvedCount
                          )}
                    </p>
                  </div>
                </div>
              </div>

              {event.deadlineHoursBefore && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  <Clock className="h-4 w-4 shrink-0" />
                  募集締切: 開始の{event.deadlineHoursBefore}時間前
                </div>
              )}

              {/* レベル補足 */}
              {event.levelNote && (
                <div className="flex items-start gap-2 text-sm">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      レベル補足
                    </p>
                    <p className="mt-0.5">{event.levelNote}</p>
                  </div>
                </div>
              )}

              {/* 詳細セクション */}
              <div className="space-y-4 border-t border-border/60 pt-5">
                {event.description && (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        説明
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}

                {event.rules && (
                  <div className="flex items-start gap-2">
                    <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        参加ルール
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {event.rules}
                      </p>
                    </div>
                  </div>
                )}

                {event.equipment && (
                  <div className="flex items-start gap-2">
                    <Backpack className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        持ち物・装備
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {event.equipment}
                      </p>
                    </div>
                  </div>
                )}

                {event.notes && (
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">
                        備考
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {event.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 主催者情報 */}
              <div className="flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  主催: {event.organizer.displayName} ・ 作成日:{' '}
                  {formatDate(event.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 申請ボタン - モバイルではスティッキー */}
          {user && event.status === 'published' && (
            <div className="sticky bottom-0 z-10 -mx-4 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:mt-4 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
              <ApplicationButton
                eventId={event.id}
                organizerId={event.organizerId}
                userId={user.id}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
