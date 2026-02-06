import { Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  CalendarPlus,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getEvents } from '@/actions/event-actions';
import { EventList } from '@/components/event/event-list';
import { EventFilter } from '@/components/event/event-filter';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

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

  const hasFilters = params.dateRange || params.municipality || params.level;

  return (
    <>
      {/* ヒーローセクション - フィルタ未使用・1ページ目のみ表示 */}
      {!hasFilters && page === 1 && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/8 to-background">
          {/* 装飾背景 */}
          <div className="absolute inset-0">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10" />
            <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-accent/10" />
          </div>
          <div className="container relative mx-auto px-4 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                宮城県の
                <span className="text-primary">バドミントン練習会</span>
                を見つけよう
              </h1>
              <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
                レベル・地域で自分にぴったりの練習会を検索。
                <br className="hidden sm:block" />
                かんたんに参加申請、主催者とのチャットもスムーズ。
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="#events">
                  <Button
                    size="lg"
                    className="gap-2 px-8 font-semibold shadow-md"
                  >
                    <Search className="h-4 w-4" />
                    練習会を探す
                  </Button>
                </Link>
                <Link href={ROUTES.EVENTS_NEW}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 px-8 font-semibold"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    練習会を作成
                  </Button>
                </Link>
              </div>
            </div>
            {/* 特徴 */}
            <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">かんたん検索</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  日付・地域・レベルで
                  <br />
                  あなたに合う練習会を発見
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">宮城県38市区町村</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  県内全域の練習会を
                  <br />
                  ひとつのプラットフォームで
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">安心の承認制</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  主催者が参加者を管理。
                  <br />
                  安心して参加できる
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* イベント一覧 */}
      <section id="events" className="container mx-auto px-4 py-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-bold sm:text-2xl">練習会を探す</h2>
          </div>
          <Suspense>
            <EventFilter />
          </Suspense>
        </div>

        <EventList events={events} />

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1.5">
            {page > 1 ? (
              <Link
                href={`/?${new URLSearchParams({
                  ...(params.dateRange ? { dateRange: params.dateRange } : {}),
                  ...(params.municipality
                    ? { municipality: params.municipality }
                    : {}),
                  ...(params.level ? { level: params.level } : {}),
                  page: String(page - 1),
                }).toString()}`}
              >
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
            )}

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
                  <Button
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className={
                      p === page
                        ? 'pointer-events-none font-bold shadow-sm'
                        : ''
                    }
                  >
                    {p}
                  </Button>
                </Link>
              );
            })}

            {page < totalPages ? (
              <Link
                href={`/?${new URLSearchParams({
                  ...(params.dateRange ? { dateRange: params.dateRange } : {}),
                  ...(params.municipality
                    ? { municipality: params.municipality }
                    : {}),
                  ...(params.level ? { level: params.level } : {}),
                  page: String(page + 1),
                }).toString()}`}
              >
                <Button variant="outline" size="sm" className="gap-1">
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
