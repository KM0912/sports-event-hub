import { notFound, redirect } from 'next/navigation';
import { getEventById } from '@/actions/event-actions';
import { getAuthUser } from '@/actions/auth-actions';
import { EventForm } from '@/components/event/event-form';
import { ROUTES } from '@/constants/routes';

interface CopyEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function CopyEventPage({ params }: CopyEventPageProps) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.LOGIN);

  const result = await getEventById(id);
  if (!result.success) notFound();

  const event = result.data;
  if (event.organizerId !== user.id) redirect(ROUTES.DASHBOARD);

  return (
    <div className="container mx-auto px-4 py-8">
      <EventForm
        initialData={{
          title: event.title,
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
