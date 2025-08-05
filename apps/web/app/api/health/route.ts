import { NextRequest, NextResponse } from 'next/server'
import type { HealthCheckResponse } from '@boilerplate/types'

export async function GET(request: NextRequest) {
  try {
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'boilerplate-backend-nextjs'
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'boilerplate-backend-nextjs'
    }

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}