import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@boilerplate/types'

export async function GET(request: NextRequest) {
  const response: ApiResponse = {
    message: 'Boilerplate Backend API - Next.js 15',
    data: {
      version: '0.1.0',
      framework: 'Next.js 15',
      timestamp: new Date().toISOString()
    }
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}