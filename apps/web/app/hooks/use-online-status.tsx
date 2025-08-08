'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/utils/logger'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      logger.info('Connection restored - resuming queries')
      
      // Resume queries when coming back online
      queryClient.resumePausedMutations()
      queryClient.invalidateQueries()
    }

    const handleOffline = () => {
      setIsOnline(false)
      logger.warn('Connection lost - pausing queries')
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient])

  return isOnline
}