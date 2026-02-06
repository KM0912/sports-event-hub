import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/actions/auth-actions';
import { getMyApplications } from '@/actions/application-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <h1 className="mb-6 text-2xl font-bold">マイページ</h1>

      {applications.length === 0 && (
        <p className="text-center text-muted-foreground">
          申請した練習会はまだありません
        </p>
      )}

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <Link
                      href={ROUTES.EVENT_DETAIL(app.event.id)}
                      className="hover:underline"
                    >
                      {app.event.title}
                    </Link>
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatEventDate(
                      app.event.startDatetime,
                      app.event.endDatetime
                    )}
                  </p>
                </div>
                <ApplicationBadge status={app.status as ApplicationStatus} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  主催: {app.event.organizer.displayName}
                </span>
                {app.status === 'approved' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={ROUTES.CHAT(app.event.id, app.event.organizerId)}
                    >
                      チャット
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
