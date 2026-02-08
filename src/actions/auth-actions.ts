'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import type { ActionResult } from '@/types/action-result';

export async function signUp(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://127.0.0.1:3000' : ''}/profile/setup`,
    },
  });

  if (error) {
    return { success: false, error: error.message, code: 'AUTH_ERROR' };
  }

  return { success: true, data: undefined };
}

export async function signIn(
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: 'メールアドレスまたはパスワードが正しくありません',
      code: 'AUTH_ERROR',
    };
  }

  return { success: true, data: undefined };
}

export async function signInWithGoogle(): Promise<
  ActionResult<{ url: string }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://127.0.0.1:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message, code: 'AUTH_ERROR' };
  }

  return { success: true, data: { url: data.url } };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(ROUTES.HOME);
}

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
