import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-8 sm:py-12">
      <LoginForm />
    </div>
  );
}
