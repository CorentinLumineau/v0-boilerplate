import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Global type declaration for notification streams
declare global {
  var notificationStreams: Map<string, { controller: ReadableStreamDefaultController; isClosed: () => boolean }> | undefined
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Create SSE response
    const encoder = new TextEncoder()
    let heartbeatInterval: NodeJS.Timeout
    let isClosed = false
    
    const stream = new ReadableStream({
      start(controller) {
        try {
          // Send initial connection message
          const initMessage = `event: connected\ndata: ${JSON.stringify({
            message: 'Connected to notification stream',
            userId,
            timestamp: new Date().toISOString(),
          })}\n\n`
          controller.enqueue(encoder.encode(initMessage))

          // Set up heartbeat to keep connection alive
          heartbeatInterval = setInterval(() => {
            if (isClosed) {
              clearInterval(heartbeatInterval)
              return
            }
            
            try {
              const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({
                timestamp: new Date().toISOString(),
              })}\n\n`
              controller.enqueue(encoder.encode(heartbeat))
            } catch (error) {
              console.error('Heartbeat error:', error)
              clearInterval(heartbeatInterval)
              if (!isClosed) {
                isClosed = true
                try {
                  controller.close()
                } catch (e) {
                  // Already closed
                }
              }
            }
          }, 30000) // Send heartbeat every 30 seconds

          // Clean up on request abortion
          request.signal.addEventListener('abort', () => {
            isClosed = true
            if (heartbeatInterval) {
              clearInterval(heartbeatInterval)
            }
            globalThis.notificationStreams?.delete(userId)
          })

          // Example: Send a welcome notification after 2 seconds
          // setTimeout(async () => {
          //   if (isClosed) return
            
          //   try {
          //     // Create a real notification in the database
          //     const welcomeNotification = await prisma.notification.create({
          //       data: {
          //         title: 'Welcome to real-time notifications!',
          //         message: 'You will receive notifications here in real-time.',
          //         type: 'INFO',
          //         userId: userId,
          //       },
          //       select: {
          //         id: true,
          //         title: true,
          //         message: true,
          //         type: true,
          //         status: true,
          //         data: true,
          //         createdAt: true,
          //         readAt: true,
          //       },
          //     })

          //     // Send the notification via SSE
          //     const sseMessage = `event: notification\ndata: ${JSON.stringify(welcomeNotification)}\n\n`
          //     controller.enqueue(encoder.encode(sseMessage))
          //   } catch (error) {
          //     console.error('Welcome notification error:', error)
          //   }
          // }, 2000)

          // Store the controller globally so other parts of the app can send notifications
          // In a real application, you'd use a more sophisticated pub/sub system
          globalThis.notificationStreams = globalThis.notificationStreams || new Map()
          globalThis.notificationStreams.set(userId, { controller, isClosed: () => isClosed })
        } catch (error) {
          console.error('SSE stream setup error:', error)
          isClosed = true
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval)
          }
        }
      },
      
      cancel() {
        isClosed = true
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval)
        }
        globalThis.notificationStreams?.delete(userId)
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // Remove CORS headers - they will be handled by middleware
      },
    })
  } catch (error) {
    console.error('SSE stream error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to broadcast notifications to connected clients
function broadcastNotification(userId: string, notification: any) {
  if (globalThis.notificationStreams?.has(userId)) {
    const streamInfo = globalThis.notificationStreams.get(userId)
    
    // Check if stream is still active
    if (streamInfo && streamInfo.isClosed()) {
      globalThis.notificationStreams.delete(userId)
      return
    }
    
    try {
      const encoder = new TextEncoder()
      const message = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
      streamInfo?.controller.enqueue(encoder.encode(message))
    } catch (error) {
      console.error('Error broadcasting notification:', error)
      // Remove broken stream
      globalThis.notificationStreams.delete(userId)
    }
  }
}