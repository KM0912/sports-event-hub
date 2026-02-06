import { ProfileForm } from '@/components/auth/profile-form';
import { getProfile } from '@/actions/profile-actions';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default async function ProfileSetupPage() {
  const result = await getProfile();

  if (result.success && result.data) {
    redirect(ROUTES.HOME);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <ProfileForm />
    </div>
  );
}
