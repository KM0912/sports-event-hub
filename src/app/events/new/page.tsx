import { redirect } from 'next/navigation';
import { getAuthUser } from '@/actions/auth-actions';
import { EventForm } from '@/components/event/event-form';
import { ROUTES } from '@/constants/routes';

export default async function NewEventPage() {
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.LOGIN);

  return (
    <div className="container mx-auto px-4 py-8">
      <EventForm />
    </div>
  );
}
