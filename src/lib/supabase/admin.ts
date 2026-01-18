import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Service Role Key を使用した管理者クライアント
// RLSをバイパスしてauth.usersテーブルにアクセスできる
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ユーザーIDからメールアドレスを取得
export async function getUserEmail(userId: string): Promise<string | null> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.getUserById(userId)

  if (error || !data.user) {
    console.error('Error fetching user email:', error)
    return null
  }

  return data.user.email ?? null
}

// 複数ユーザーのメールアドレスを一括取得
export async function getUserEmails(
  userIds: string[]
): Promise<Map<string, string>> {
  const adminClient = createAdminClient()
  const emailMap = new Map<string, string>()

  // auth.admin.listUsersは全ユーザーを取得するため、個別に取得
  const promises = userIds.map(async (userId) => {
    const { data, error } = await adminClient.auth.admin.getUserById(userId)
    if (!error && data.user?.email) {
      emailMap.set(userId, data.user.email)
    }
  })

  await Promise.all(promises)
  return emailMap
}
