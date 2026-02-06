import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MessageCircle,
  User,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { getAuthUser } from '@/actions/auth-actions';
import { getMyApplications } from '@/actions/application-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationBadge } from '@/components/application/application-badge';
import { ROUTES } from '@/constants/routes';
import { formatEventDate } from '@/lib/utils/date-utils';
import type { ApplicationStatus } from '@/types/application';

export default async function MyPage() {
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.LOGIN);

  const result = await getMyApplications();
  const applications = result.success ? result.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <div className="h-7 w-1 rounded-full bg-primary" />
            マイページ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            申請した練習会の一覧
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link href={ROUTES.PROFILE_SETUP}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">プロフィール編集</span>
          </Link>
        </Button>
      </div>

      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="text-base font-medium text-muted-foreground">
            申請した練習会はまだありません
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            トップページから練習会を探して参加してみましょう
          </p>
          <Button asChild className="mt-6 gap-1.5 font-semibold">
            <Link href={ROUTES.HOME}>練習会を探す</Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {applications.map((app) => (
          <Card
            key={app.id}
            className="border-border/60 py-0 shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Link
                      href={ROUTES.EVENT_DETAIL(app.event.id)}
                      className="truncate text-base font-bold transition-colors hover:text-primary"
                    >
                      {app.event.title}
                    </Link>
                    <ApplicationBadge
                      status={app.status as ApplicationStatus}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatEventDate(
                        app.event.startDatetime,
                        app.event.endDatetime
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {app.event.organizer.displayName}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {app.status === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1 border-border/60"
                    >
                      <Link
                        href={ROUTES.CHAT(app.event.id, app.event.organizerId)}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">チャット</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="gap-1 text-muted-foreground"
                  >
                    <Link href={ROUTES.EVENT_DETAIL(app.event.id)}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
