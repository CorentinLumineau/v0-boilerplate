/**
 * TypeScript interfaces for API testing
 */

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  token?: string;
  error?: string;
}

// User types
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data?: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

// API Error types
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export interface ValidationError {
  success: false;
  error: string;
  details: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  };
}

// Health check types
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}