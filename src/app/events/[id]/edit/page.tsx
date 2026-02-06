import { notFound, redirect } from 'next/navigation';
import { getEventById } from '@/actions/event-actions';
import { getAuthUser } from '@/actions/auth-actions';
import { EventForm } from '@/components/event/event-form';
import { ROUTES } from '@/constants/routes';
import { isEventStarted } from '@/lib/utils/date-utils';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.LOGIN);

  const result = await getEventById(id);
  if (!result.success) notFound();

  const event = result.data;
  if (event.organizerId !== user.id) redirect(ROUTES.DASHBOARD);
  if (isEventStarted(event.startDatetime)) redirect(ROUTES.DASHBOARD);

  return (
    <div className="container mx-auto px-4 py-8">
      <EventForm
        eventId={event.id}
        initialData={{
          title: event.title,
          startDatetime: new Date(event.startDatetime),
          endDatetime: new Date(event.endDatetime),
          venueName: event.venueName,
          venueAddress: event.venueAddress,
          municipality: event.municipality,
          level: event.level,
          levelNote: event.levelNote ?? undefined,
          capacity: event.capacity,
          fee: event.fee,
          description: event.description ?? undefined,
          rules: event.rules ?? undefined,
          equipment: event.equipment ?? undefined,
          notes: event.notes ?? undefined,
          deadlineHoursBefore: event.deadlineHoursBefore ?? undefined,
        }}
      />
    </div>
  );
}
