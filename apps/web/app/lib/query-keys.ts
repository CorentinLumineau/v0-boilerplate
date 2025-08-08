/**
 * Centralized query key factory for all API endpoints
 * Ensures consistent and type-safe query key patterns across the application
 */

// Base query key types - allow any serializable values in query keys
type BaseQueryKey = readonly (string | number | Record<string, any>)[]
type QueryKeyFactory<T extends Record<string, (...args: any[]) => BaseQueryKey>> = {
  readonly [K in keyof T]: T[K]
} & {
  readonly _def: BaseQueryKey
}

// Helper function to create query key factories
function createQueryKeys<T extends Record<string, (...args: any[]) => BaseQueryKey>>(
  baseKey: string,
  keys: T
): QueryKeyFactory<T> {
  const _def = [baseKey] as const
  return {
    _def,
    ...keys
  } as QueryKeyFactory<T>
}

// Auth query keys
export const authKeys = createQueryKeys('auth', {
  all: () => ['auth'] as const,
  session: () => ['auth', 'session'] as const,
  user: (userId: string) => ['auth', 'user', userId] as const,
})

// Notifications query keys  
export const notificationKeys = createQueryKeys('notifications', {
  all: () => ['notifications'] as const,
  lists: () => ['notifications', 'list'] as const,
  list: (filters: Record<string, any> = {}) => ['notifications', 'list', filters] as const,
  details: () => ['notifications', 'detail'] as const,
  detail: (id: string) => ['notifications', 'detail', id] as const,
  unreadCount: () => ['notifications', 'unreadCount'] as const,
})

// User preferences query keys
export const preferencesKeys = createQueryKeys('preferences', {
  all: () => ['preferences'] as const,
  user: () => ['preferences', 'user'] as const,
  theme: () => ['preferences', 'theme'] as const,
  language: () => ['preferences', 'language'] as const,
})

// Users query keys (for future user management features)
export const userKeys = createQueryKeys('users', {
  all: () => ['users'] as const,
  lists: () => ['users', 'list'] as const,
  list: (filters: Record<string, any> = {}) => ['users', 'list', filters] as const,
  details: () => ['users', 'detail'] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
  profile: (id: string) => ['users', 'profile', id] as const,
})

// Settings query keys (for app-wide settings)
export const settingsKeys = createQueryKeys('settings', {
  all: () => ['settings'] as const,
  app: () => ['settings', 'app'] as const,
  feature: (feature: string) => ['settings', 'feature', feature] as const,
})

// Health check query keys
export const healthKeys = createQueryKeys('health', {
  all: () => ['health'] as const,
  api: () => ['health', 'api'] as const,
  database: () => ['health', 'database'] as const,
})

// Export all query keys for easy access
export const queryKeys = {
  auth: authKeys,
  notifications: notificationKeys,
  preferences: preferencesKeys,
  users: userKeys,
  settings: settingsKeys,
  health: healthKeys,
} as const

// Type helpers for query keys
export type AuthQueryKeys = typeof authKeys
export type NotificationQueryKeys = typeof notificationKeys
export type PreferencesQueryKeys = typeof preferencesKeys
export type UserQueryKeys = typeof userKeys
export type SettingsQueryKeys = typeof settingsKeys
export type HealthQueryKeys = typeof healthKeys

// Utility function to get all query keys for cache invalidation
export function getAllQueryKeys(): readonly string[] {
  return Object.values(queryKeys).map(factory => String(factory._def[0]))
}

// Utility function to invalidate all queries of a specific type
export function getQueryKeysForInvalidation(type: keyof typeof queryKeys) {
  return queryKeys[type].all()
}