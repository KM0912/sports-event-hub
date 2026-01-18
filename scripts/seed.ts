/**
 * Seed script for development environment
 * 
 * This script creates sample users and data for development.
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 * 
 * Or add to package.json:
 *   "seed": "tsx scripts/seed.ts"
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local file if it exists
try {
  const envPath = join(process.cwd(), '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (error) {
  // .env.local not found, continue with environment variables
}

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  console.error('For local development, you can find this in Supabase Studio or .env.local')
  process.exit(1)
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface SeedUser {
  email: string
  password: string
  displayName: string
}

const seedUsers: SeedUser[] = [
  { email: 'test1@example.com', password: 'password123', displayName: 'テストユーザー1' },
  { email: 'test2@example.com', password: 'password123', displayName: 'テストユーザー2' },
  { email: 'test3@example.com', password: 'password123', displayName: 'テストユーザー3' },
  { email: 'test4@example.com', password: 'password123', displayName: 'テストユーザー4' },
]

async function createUser(user: SeedUser) {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers.users.find(u => u.email === user.email)

  if (existingUser) {
    console.log(`User ${user.email} already exists, skipping creation`)
    return existingUser.id
  }

  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true, // Auto-confirm for development
    user_metadata: {
      display_name: user.displayName
    }
  })

  if (error) {
    console.error(`Error creating user ${user.email}:`, error.message)
    return null
  }

  console.log(`Created user: ${user.email} (${data.user.id})`)
  return data.user.id
}

async function createProfile(userId: string, displayName: string) {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    console.log(`Profile for ${userId} already exists, skipping creation`)
    return
  }

  // Create profile
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      display_name: displayName
    })

  if (error) {
    console.error(`Error creating profile for ${userId}:`, error.message)
    return
  }

  console.log(`Created profile: ${displayName}`)
}

async function createEvents(userIds: string[]) {
  if (userIds.length === 0) {
    console.log('No users available, skipping event creation')
    return
  }

  const hostId = userIds[0]
  const now = new Date()

  const events = [
    {
      host_user_id: hostId,
      title: '初心者歓迎！バドミントン交流会',
      description: '初心者から中級者まで楽しめるバドミントン交流会です。ラケットはレンタル可能です。',
      start_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      venue_name: 'スポーツセンター',
      address: '東京都渋谷区1-1-1',
      city: '東京都',
      fee: 500,
      visitor_capacity: 8,
      level: 'beginner',
      level_notes: '初心者でも安心して参加できます',
      equipment: 'ラケット、シューズ（体育館用）',
      participation_rules: '参加費は当日現金でお支払いください。',
      notes: 'お水やタオルをお持ちください。',
      application_deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published'
    },
    {
      host_user_id: hostId,
      title: '中級者向けバドミントン練習会',
      description: '中級者向けの練習会です。ダブルスを中心に練習します。',
      start_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      venue_name: '区民体育館',
      address: '東京都新宿区2-2-2',
      city: '東京都',
      fee: 800,
      visitor_capacity: 12,
      level: 'intermediate',
      level_notes: '中級者以上を想定しています',
      equipment: 'ラケット、シューズ、タオル',
      participation_rules: '参加費は事前振込をお願いします。',
      notes: '水分補給を忘れずに。',
      application_deadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published'
    },
    {
      host_user_id: hostId,
      title: '上級者向けバドミントン大会',
      description: '上級者向けの大会形式のイベントです。シングルスとダブルスを行います。',
      start_at: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      venue_name: '都立体育館',
      address: '東京都港区3-3-3',
      city: '東京都',
      fee: 1500,
      visitor_capacity: 16,
      level: 'advanced',
      level_notes: '上級者限定です',
      equipment: 'ラケット、シューズ、ユニフォーム',
      participation_rules: '参加費は事前振込必須です。',
      notes: '審判も行います。',
      application_deadline: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published'
    },
    {
      host_user_id: hostId,
      title: '誰でも参加OK！バドミントンサークル',
      description: 'レベル問わず誰でも参加できるサークル活動です。',
      start_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
      venue_name: 'コミュニティセンター',
      address: '東京都世田谷区4-4-4',
      city: '東京都',
      fee: 300,
      visitor_capacity: 20,
      level: 'all',
      level_notes: '初心者から上級者まで歓迎',
      equipment: 'ラケット、シューズ',
      participation_rules: '参加費は当日現金でお支払いください。',
      notes: 'お気軽にご参加ください！',
      application_deadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published'
    }
  ]

  for (const event of events) {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select('id')
      .single()

    if (error) {
      console.error(`Error creating event "${event.title}":`, error.message)
    } else {
      console.log(`Created event: ${event.title} (${data.id})`)
    }
  }
}

async function createApplications(userIds: string[]) {
  if (userIds.length < 2) {
    console.log('Not enough users for applications, skipping')
    return
  }

  // Get events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(3)

  if (eventsError || !events || events.length === 0) {
    console.log('No events found, skipping applications')
    return
  }

  const applications = [
    {
      event_id: events[0].id,
      user_id: userIds[1],
      status: 'pending',
      comment: '参加希望です！'
    },
    {
      event_id: events[0].id,
      user_id: userIds[2] || userIds[1],
      status: 'approved',
      comment: 'よろしくお願いします！'
    },
    {
      event_id: events[1]?.id,
      user_id: userIds[1],
      status: 'approved',
      comment: '楽しみにしています'
    }
  ]

  for (const app of applications) {
    if (!app.event_id) continue

    const { error } = await supabase
      .from('applications')
      .insert(app)
      .select()

    if (error) {
      // Ignore unique constraint errors (already exists)
      if (!error.message.includes('duplicate key')) {
        console.error(`Error creating application:`, error.message)
      }
    } else {
      console.log(`Created application for event ${app.event_id}`)
    }
  }
}

async function main() {
  console.log('Starting seed process...\n')

  // Step 1: Create users
  console.log('Step 1: Creating users...')
  const userIds: string[] = []
  for (const user of seedUsers) {
    const userId = await createUser(user)
    if (userId) {
      userIds.push(userId)
    }
  }
  console.log(`Created ${userIds.length} users\n`)

  // Step 2: Create profiles
  console.log('Step 2: Creating profiles...')
  for (let i = 0; i < userIds.length && i < seedUsers.length; i++) {
    await createProfile(userIds[i], seedUsers[i].displayName)
  }
  console.log('Profiles created\n')

  // Step 3: Create events
  console.log('Step 3: Creating events...')
  await createEvents(userIds)
  console.log('Events created\n')

  // Step 4: Create applications
  console.log('Step 4: Creating applications...')
  await createApplications(userIds)
  console.log('Applications created\n')

  console.log('Seed process completed!')
  console.log('\nTest users created:')
  seedUsers.forEach((user, index) => {
    if (index < userIds.length) {
      console.log(`  - ${user.email} / ${user.password} (${user.displayName})`)
    }
  })
}

main().catch(console.error)
