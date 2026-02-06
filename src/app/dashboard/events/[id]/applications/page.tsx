import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/actions/auth-actions';
import { getEventById } from '@/actions/event-actions';
import { getApplicationsByEvent } from '@/actions/application-actions';
import { ApplicationList } from '@/components/application/application-list';
import { ROUTES } from '@/constants/routes';

interface ApplicationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.LOGIN);

  const eventResult = await getEventById(id);
  if (!eventResult.success) notFound();

  const event = eventResult.data;
  if (event.organizerId !== user.id) notFound();

  const appsResult = await getApplicationsByEvent(id);
  const applications = appsResult.success ? appsResult.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">申請管理</h1>
        <p className="mb-6 text-muted-foreground">{event.title}</p>
        <ApplicationList
          applications={applications}
          capacity={event.capacity}
        />
      </div>
    </div>
  );
}
