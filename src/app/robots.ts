import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://miyagi-badminton.jp'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/profile/setup',
          '/profile/edit',
          '/events/new',
          '/events/*/edit',
          '/events/*/applications',
          '/events/*/chat',
          '/mypage',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
