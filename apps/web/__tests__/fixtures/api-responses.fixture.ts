import { createUserFactory } from '../factories/user.factory';

// Standard API response structures
export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message,
});

export const errorResponse = (error: string, status = 400, details?: any) => ({
  success: false,
  error,
  status,
  details,
});

export const paginationResponse = <T>(
  items: T[],
  page = 1,
  limit = 10,
  total?: number
) => {
  const actualTotal = total ?? items.length;
  const totalPages = Math.ceil(actualTotal / limit);
  
  return successResponse({
    items,
    pagination: {
      page,
      limit,
      total: actualTotal,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

// User-specific API responses
export const userApiResponses = {
  getUserSuccess: () => successResponse(createUserFactory()),
  
  getUsersSuccess: (count = 5) => 
    paginationResponse(
      Array.from({ length: count }, () => createUserFactory()),
      1,
      10,
      count
    ),
    
  createUserSuccess: () => successResponse(
    createUserFactory(),
    'User created successfully'
  ),
  
  updateUserSuccess: () => successResponse(
    createUserFactory(),
    'User updated successfully'
  ),
  
  deleteUserSuccess: () => successResponse(
    null,
    'User deleted successfully'
  ),
  
  userNotFound: () => errorResponse('User not found', 404),
  
  userValidationError: () => errorResponse(
    'Validation failed',
    400,
    {
      email: 'Email is required',
      firstName: 'First name is required',
    }
  ),
  
  userConflictError: () => errorResponse(
    'User with this email already exists',
    409
  ),
};

// Auth API responses  
export const authApiResponses = {
  loginSuccess: () => successResponse({
    user: createUserFactory(),
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    expiresIn: 3600,
  }),
  
  loginFailure: () => errorResponse('Invalid credentials', 401),
  
  logoutSuccess: () => successResponse(null, 'Logged out successfully'),
  
  unauthorizedError: () => errorResponse('Unauthorized access', 401),
  
  forbiddenError: () => errorResponse('Insufficient permissions', 403),
};

// Health check responses
export const healthApiResponses = {
  healthy: () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(Math.random() * 10000),
    version: '1.0.0',
    environment: 'test',
  }),
  
  unhealthy: () => ({
    status: 'error',
    timestamp: new Date().toISOString(),
    error: 'Database connection failed',
  }),
};

// Generic error responses
export const genericApiResponses = {
  internalServerError: () => errorResponse('Internal server error', 500),
  
  notFound: () => errorResponse('Resource not found', 404),
  
  badRequest: () => errorResponse('Bad request', 400),
  
  rateLimitExceeded: () => errorResponse('Rate limit exceeded', 429),
  
  serviceUnavailable: () => errorResponse('Service temporarily unavailable', 503),
};