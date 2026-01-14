import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://miyagi-badminton.jp'
  const supabase = await createClient()

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 公開中のイベントを取得
  const { data: events } = await supabase
    .from('events')
    .select('id, updated_at')
    .eq('status', 'published')
    .gte('start_at', new Date().toISOString())

  const eventPages: MetadataRoute.Sitemap = events?.map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.updated_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) || []

  return [...staticPages, ...eventPages]
}
