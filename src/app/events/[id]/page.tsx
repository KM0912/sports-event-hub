import { notFound } from 'next/navigation';
import { getEventById } from '@/actions/event-actions';
import { getAuthUser } from '@/actions/auth-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const result = await getEventById(id);
  if (!result.success) notFound();

  const event = result.data;
  const user = await getAuthUser();
  const levelInfo = EVENT_LEVELS[event.level as EventLevel];

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
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{event.municipality}</Badge>
              <Badge variant="secondary">{levelInfo.label}</Badge>
              {event.status === 'cancelled' && (
                <Badge variant="destructive">キャンセル済み</Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {formatEventDate(event.startDatetime, event.endDatetime)}
              </p>
              <p>
                {event.venueName} ({event.venueAddress})
              </p>
            </div>

            <Separator />

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">参加費</p>
                <p className="font-medium">{formatCurrency(event.fee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">残り枠</p>
                <p className="font-medium">
                  {formatRemainingSlots(event.capacity, event.approvedCount)}
                </p>
              </div>
            </div>

            {event.levelNote && (
              <div>
                <p className="text-sm text-muted-foreground">レベル補足</p>
                <p>{event.levelNote}</p>
              </div>
            )}

            {event.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  説明
                </p>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {event.rules && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  参加ルール
                </p>
                <p className="whitespace-pre-wrap">{event.rules}</p>
              </div>
            )}

            {event.equipment && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  持ち物・装備
                </p>
                <p className="whitespace-pre-wrap">{event.equipment}</p>
              </div>
            )}

            {event.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  備考
                </p>
                <p className="whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}

            <Separator />

            <p className="text-sm text-muted-foreground">
              主催: {event.organizer.displayName} ・ 作成日:{' '}
              {formatDate(event.createdAt)}
            </p>

            {user && event.status === 'published' && (
              <ApplicationButton
                eventId={event.id}
                organizerId={event.organizerId}
                userId={user.id}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
