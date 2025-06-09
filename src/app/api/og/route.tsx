import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Promptu'

  // Fetch the background image
  const backgroundImageUrl = new URL('/og-background.png', request.url).toString()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
          position: 'relative',
        }}
      >
        {/* Background Image */}
        <img
          src={backgroundImageUrl}
          alt="Background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Title Overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: '36px',
            fontWeight: '500',
            color: '#7C7C7C',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: '1.3',
            padding: '0 40px',
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
} 