/**
 * Application constants and configuration
 * Centralized location for all magic numbers and configuration values
 */

// Timing constants
export const TIMING = {
  // Debounce delays (in milliseconds)
  PREFERENCES_UPDATE_DEBOUNCE: 500,
  SEARCH_DEBOUNCE: 300,
  AUTO_SAVE_DEBOUNCE: 1000,
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  DATABASE_TIMEOUT: 10000, // 10 seconds
  
  // Retry delays
  RETRY_DELAY_BASE: 1000, // Base delay for exponential backoff
  MAX_RETRIES: 3,
} as const

// UI constants
export const UI = {
  // CSS values
  DEFAULT_RADIUS: '0.5rem',
  
  // Animation durations
  ANIMATION_DURATION_FAST: '150ms',
  ANIMATION_DURATION_NORMAL: '300ms',
  ANIMATION_DURATION_SLOW: '500ms',
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 50,
    MODAL: 60,
    TOOLTIP: 70,
    TOAST: 80,
    OVERLAY: 90,
  },
  
  // Breakpoints (should match Tailwind config)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const

// API constants
export const API = {
  // Endpoints
  ENDPOINTS: {
    PREFERENCES: '/api/preferences',
    HEALTH: '/api/health',
    AUTH: '/api/auth',
    NOTIFICATIONS: '/api/notifications',
  },
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
  
  // Request limits
  LIMITS: {
    MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
    RATE_LIMIT_REQUESTS: 100,
    RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute in ms
  },
} as const

// Database constants
export const DATABASE = {
  // Field limits
  LIMITS: {
    USER_NAME_MAX_LENGTH: 255,
    EMAIL_MAX_LENGTH: 320, // RFC 5321 standard
    NOTIFICATION_TITLE_MAX_LENGTH: 255,
    NOTIFICATION_MESSAGE_MAX_LENGTH: 1000,
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
} as const

// Logging constants
export const LOGGING = {
  // Log levels
  LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  },
  
  // Default log level
  DEFAULT_LEVEL: process.env.NODE_ENV === 'development' ? 3 : 1, // DEBUG in dev, WARN in production
  
  // Category mappings
  CATEGORIES: {
    API: 'API',
    SETTINGS: 'SETTINGS', 
    PREFERENCES: 'PREFERENCES',
    AUTH: 'AUTH',
    DATABASE: 'DATABASE'
  },
  
  // Production logging flag
  ENABLED_IN_PRODUCTION: true,
  
  // Log prefixes for different modules
  PREFIXES: {
    API: '[API]',
    AUTH: '[AUTH]', 
    SETTINGS: '[Settings]',
    PREFERENCES: '[Preferences]',
    NOTIFICATION: '[Notification]',
    DATABASE: '[Database]',
  },
} as const

// Feature flags and environment
export const FEATURES = {
  // Development features
  DEBUG_ENABLED: process.env.NODE_ENV === 'development',
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Feature toggles
  PWA_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
  ANALYTICS_ENABLED: process.env.NODE_ENV === 'production',
} as const

// Default values
export const DEFAULTS = {
  // User preferences
  PREFERENCES: {
    COLOR_THEME: 'default' as const,
    LANGUAGE: 'en' as const,
    THEME_MODE: 'system' as const,
  },
  
  // Notification settings
  NOTIFICATIONS: {
    ENABLED: true,
    TYPES: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'SYSTEM'] as const,
  },
} as const

// Validation constants
export const VALIDATION = {
  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  
  // Input sanitization
  SANITIZATION: {
    STRIP_HTML: true,
    TRIM_WHITESPACE: true,
    MAX_INPUT_LENGTH: 10000,
  },
} as const

// Performance constants  
export const PERFORMANCE = {
  // Cache durations (in milliseconds)
  CACHE_DURATION: {
    USER_SESSION: 15 * 60 * 1000, // 15 minutes
    USER_PREFERENCES: 5 * 60 * 1000, // 5 minutes
    STATIC_DATA: 60 * 60 * 1000, // 1 hour
  },
  
  // Bundle size limits (in bytes)
  BUNDLE_LIMITS: {
    WARNING_SIZE: 500 * 1024, // 500KB
    ERROR_SIZE: 1024 * 1024, // 1MB
  },
} as const

// Export all constants as a single object for convenience
export const CONSTANTS = {
  TIMING,
  UI,
  API,
  DATABASE,
  LOGGING,
  FEATURES,
  DEFAULTS,
  VALIDATION,
  PERFORMANCE,
} as const

export default CONSTANTS