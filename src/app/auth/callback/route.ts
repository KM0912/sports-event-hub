import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'

  // 開発環境でのデバッグ用ログ
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth callback - Origin:', requestUrl.origin)
    console.log('Auth callback - RedirectTo:', redirectTo)
  }

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
    }
    
    if (!error && user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Redirect to profile setup if no profile exists
        const redirectUrl = new URL(`/profile/setup?redirectTo=${encodeURIComponent(redirectTo)}`, requestUrl.origin)
        if (process.env.NODE_ENV === 'development') {
          console.log('Redirecting to profile setup:', redirectUrl.toString())
        }
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  const finalRedirectUrl = new URL(redirectTo, requestUrl.origin)
  if (process.env.NODE_ENV === 'development') {
    console.log('Final redirect URL:', finalRedirectUrl.toString())
  }
  return NextResponse.redirect(finalRedirectUrl)
}
