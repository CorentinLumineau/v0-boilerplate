/**
 * Enhanced logging utility with environment-conditional logging
 * Provides structured logging with different levels and prefixes
 */

import { LOGGING, FEATURES } from '@/lib/config/constants'

type LogLevel = keyof typeof LOGGING.LEVELS
type LogPrefix = keyof typeof LOGGING.PREFIXES

interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  component?: string
  action?: string
  [key: string]: any
}

class Logger {
  private currentLevel: number

  constructor() {
    // Set log level based on environment
    this.currentLevel = FEATURES.DEBUG_ENABLED 
      ? LOGGING.LEVELS.DEBUG 
      : LOGGING.LEVELS.WARN
  }

  private shouldLog(level: LogLevel): boolean {
    return LOGGING.LEVELS[level] <= this.currentLevel
  }

  private formatMessage(
    prefix: string, 
    message: string, 
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString()
    const baseMessage = `${timestamp} ${prefix} ${message}`
    
    if (context && FEATURES.VERBOSE_LOGGING) {
      return `${baseMessage} ${JSON.stringify(context, null, 2)}`
    }
    
    return baseMessage
  }

  private log(
    level: LogLevel,
    prefix: LogPrefix,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(
      LOGGING.PREFIXES[prefix], 
      message, 
      context
    )

    switch (level) {
      case 'ERROR':
        if (error) {
          console.error(formattedMessage, error)
        } else {
          console.error(formattedMessage)
        }
        break
      case 'WARN':
        console.warn(formattedMessage)
        break
      case 'INFO':
        console.info(formattedMessage)
        break
      case 'DEBUG':
        console.debug(formattedMessage)
        break
    }
  }

  // API logging methods
  apiError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'API', message, context, error)
  }

  apiWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'API', message, context)
  }

  apiInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'API', message, context)
  }

  apiDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'API', message, context)
  }

  // Auth logging methods
  authError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'AUTH', message, context, error)
  }

  authWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'AUTH', message, context)
  }

  authInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'AUTH', message, context)
  }

  authDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'AUTH', message, context)
  }

  // Settings logging methods
  settingsError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'SETTINGS', message, context, error)
  }

  settingsWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'SETTINGS', message, context)
  }

  settingsInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'SETTINGS', message, context)
  }

  settingsDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'SETTINGS', message, context)
  }

  // Preferences logging methods
  preferencesError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'PREFERENCES', message, context, error)
  }

  preferencesWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'PREFERENCES', message, context)
  }

  preferencesInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'PREFERENCES', message, context)
  }

  preferencesDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'PREFERENCES', message, context)
  }

  // Database logging methods
  dbError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'DATABASE', message, context, error)
  }

  dbWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'DATABASE', message, context)
  }

  dbInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'DATABASE', message, context)
  }

  dbDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'DATABASE', message, context)
  }

  // Notification logging methods
  notificationError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'NOTIFICATION', message, context, error)
  }

  notificationWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'NOTIFICATION', message, context)
  }

  notificationInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'NOTIFICATION', message, context)
  }

  notificationDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'NOTIFICATION', message, context)
  }

  // User-specific logging methods
  userError(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'USER', message, context, error)
  }

  userWarn(message: string, context?: LogContext): void {
    this.log('WARN', 'USER', message, context)
  }

  userInfo(message: string, context?: LogContext): void {
    this.log('INFO', 'USER', message, context)
  }

  userDebug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'USER', message, context)
  }

  // Generic logging methods
  error(message: string, context?: LogContext, error?: Error): void {
    this.log('ERROR', 'API', message, context, error)
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', 'API', message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log('INFO', 'API', message, context)
  }

  debug(message: string, context?: LogContext): void {
    this.log('DEBUG', 'API', message, context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for use in other modules
export type { LogContext, LogLevel, LogPrefix }