import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Promptu'
  const description = searchParams.get('description') || 'Discover and share AI prompts'
  const type = searchParams.get('type') || 'prompt'

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginRight: '16px',
            }}
          >
            Promptu
          </div>
          <div
            style={{
              background: getTypeColor(type),
              color: getTypeTextColor(type),
              fontSize: '14px',
              fontWeight: '500',
              padding: '4px 12px',
              borderRadius: '12px',
              textTransform: 'capitalize',
            }}
          >
            {type}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#111827',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.2',
            marginBottom: '24px',
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '20px',
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: '1.4',
          }}
        >
          {description}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            fontSize: '16px',
            color: '#9ca3af',
          }}
        >
          promptu.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'system':
      return '#dbeafe'
    case 'user':
      return '#dcfce7'
    case 'developer':
      return '#f3e8ff'
    default:
      return '#f3f4f6'
  }
}

function getTypeTextColor(type: string): string {
  switch (type) {
    case 'system':
      return '#1e40af'
    case 'user':
      return '#166534'
    case 'developer':
      return '#7c2d12'
    default:
      return '#374151'
  }
} 