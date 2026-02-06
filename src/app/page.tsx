import { Suspense } from 'react';
import { getEvents } from '@/actions/event-actions';
import { EventList } from '@/components/event/event-list';
import { EventFilter } from '@/components/event/event-filter';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HomePageProps {
  searchParams: Promise<{
    dateRange?: string;
    municipality?: string;
    level?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = 20;

  const result = await getEvents({
    dateRange: params.dateRange as
      | 'today'
      | 'this_week'
      | 'next_week'
      | 'this_month'
      | 'next_month'
      | undefined,
    municipality: params.municipality,
    level: params.level as
      | 'beginner'
      | 'elementary'
      | 'intermediate'
      | 'advanced'
      | 'all'
      | undefined,
    page,
    perPage,
  });

  const events = result.success ? result.data.events : [];
  const totalCount = result.success ? result.data.totalCount : 0;
  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold">練習会を探す</h1>
        <Suspense>
          <EventFilter />
        </Suspense>
      </div>

      <EventList events={events} />

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const searchParamsStr = new URLSearchParams({
              ...(params.dateRange ? { dateRange: params.dateRange } : {}),
              ...(params.municipality
                ? { municipality: params.municipality }
                : {}),
              ...(params.level ? { level: params.level } : {}),
              page: String(p),
            }).toString();

            return (
              <Link key={p} href={`/?${searchParamsStr}`}>
                <Button variant={p === page ? 'default' : 'outline'} size="sm">
                  {p}
                </Button>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
