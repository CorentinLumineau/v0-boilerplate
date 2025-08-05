// Shared API types between frontend and backend
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  service: string
}

// User Preferences types
export interface UserPreferences {
  colorTheme?: string    // Color theme preference (default, red, blue, etc.)
  radiusValue?: string   // Border radius preference (0, 0.3, 0.5, 0.75, 1.0)
  language?: string      // Language preference (en, fr)
  themeMode?: string     // Theme mode preference (light, dark, system)
}

// Auth types
export interface User {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  image?: string
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
  userId: string
}

export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
}

// Notification types
export interface Notification {
  id: string
  title: string
  message?: string
  type: NotificationType
  status: NotificationStatus
  userId: string
  data?: any
  createdAt: string
  updatedAt: string
  readAt?: string
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SYSTEM = 'SYSTEM'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

// Auth request/response types
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string  
  name?: string
}

export interface AuthSession {
  user: User
  session: Session
}