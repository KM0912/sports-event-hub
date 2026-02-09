import { ProfileForm } from '@/components/auth/profile-form';
import { getProfile } from '@/actions/profile-actions';

export default async function ProfileSetupPage() {
  const result = await getProfile();

  const existingProfile = result.success ? result.data : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <ProfileForm
        initialDisplayName={existingProfile?.displayName ?? ''}
        isEdit={!!existingProfile}
      />
    </div>
  );
}
