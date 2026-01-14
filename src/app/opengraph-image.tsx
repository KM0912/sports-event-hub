import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = '宮城バドミントン練習会'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />
        
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.2)',
            marginBottom: '32px',
            fontSize: '64px',
          }}
        >
          🏸
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            宮城バドミントン練習会
          </div>
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
            }}
          >
            ビジター募集プラットフォーム
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '48px',
          }}
        >
          {['初心者歓迎', '気軽に参加', '宮城県内'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '999px',
                color: 'white',
                fontSize: '24px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
