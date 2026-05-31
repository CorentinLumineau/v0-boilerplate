import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createUserFactory } from '../factories/user.factory';
import { TEST_CREDENTIALS, TEST_AUTH } from '../config/test-credentials';
import type { 
  LoginCredentials, 
  AuthResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersListResponse,
  HealthResponse,
  ValidationError 
} from '../types/api.types';

// API handlers for mocking
export const handlers = [
  // Health check endpoint
  http.get('/api/health', (): HttpResponse => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    return HttpResponse.json(response);
  }),

  // Users API endpoints
  http.get('/api/users', ({ request }): HttpResponse => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');

    // Mock users data
    const allUsers = Array.from({ length: 25 }, (_, index) =>
      createUserFactory({
        id: `user-${index + 1}`,
        email: `user${index + 1}@test.local`,
      })
    );

    let filteredUsers = allUsers;
    if (search) {
      filteredUsers = allUsers.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / limit);

    const response: UsersListResponse = {
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };

    return HttpResponse.json(response);
  }),

  http.get('/api/users/:id', ({ params }): HttpResponse => {
    const { id } = params;
    const user = createUserFactory({
      id: id as string,
      email: `user-${id}@test.local`,
    });

    const response: UserResponse = {
      success: true,
      data: user,
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/users', async ({ request }): Promise<HttpResponse> => {
    const userData = await request.json() as CreateUserRequest;
    
    // Simulate validation
    if (!userData.email || !userData.firstName || !userData.lastName) {
      const validationError: ValidationError = {
        success: false,
        error: 'Missing required fields',
        details: {
          email: !userData.email ? 'Email is required' : undefined,
          firstName: !userData.firstName ? 'First name is required' : undefined,
          lastName: !userData.lastName ? 'Last name is required' : undefined,
        },
      };
      
      return HttpResponse.json(validationError, { status: 400 });
    }

    // Simulate email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    const newUser = createUserFactory({
      id: `new-user-${Date.now()}`,
      ...userData,
    });

    const response: UserResponse = {
      success: true,
      data: newUser,
      message: 'User created successfully',
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }): Promise<HttpResponse> => {
    const { id } = params;
    const userData = await request.json() as UpdateUserRequest;

    const updatedUser = createUserFactory({
      id: id as string,
      ...userData,
    });

    const response: UserResponse = {
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    };

    return HttpResponse.json(response);
  }),

  http.delete('/api/users/:id', ({ params }): HttpResponse => {
    const response: UserResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    return HttpResponse.json(response);
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }): Promise<HttpResponse> => {
    const credentials = await request.json() as LoginCredentials;
    
    // Check test credentials from secure config
    if (credentials.email === TEST_CREDENTIALS.ADMIN.EMAIL && 
        credentials.password === TEST_CREDENTIALS.ADMIN.PASSWORD) {
      const response: AuthResponse = {
        success: true,
        user: createUserFactory({
          id: 'admin-user',
          email: TEST_CREDENTIALS.ADMIN.EMAIL,
          role: 'admin',
        }),
        token: TEST_AUTH.TOKEN,
      };
      
      return HttpResponse.json(response);
    }

    // Check regular user credentials
    if (credentials.email === TEST_CREDENTIALS.USER.EMAIL && 
        credentials.password === TEST_CREDENTIALS.USER.PASSWORD) {
      const response: AuthResponse = {
        success: true,
        user: createUserFactory({
          id: 'regular-user',
          email: TEST_CREDENTIALS.USER.EMAIL,
          role: 'user',
        }),
        token: TEST_AUTH.TOKEN,
      };
      
      return HttpResponse.json(response);
    }

    const errorResponse: AuthResponse = {
      success: false,
      error: 'Invalid credentials',
    };

    return HttpResponse.json(errorResponse, { status: 401 });
  }),

  http.post('/api/auth/logout', (): HttpResponse => {
    const response: AuthResponse = {
      success: true,
    };
    
    return HttpResponse.json(response);
  }),

  // Fallback handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(
      `Found an unhandled ${request.method} request to ${request.url}`
    );
    return HttpResponse.json(
      {
        success: false,
        error: 'Endpoint not found',
      },
      { status: 404 }
    );
  }),
];

// Create server instance
export const server = setupServer(...handlers);

// Helper functions for test setup
export function setupMSW() {
  // Additional setup if needed
}

export function teardownMSW() {
  server.resetHandlers();
}

export function addMockHandler(handler: Parameters<typeof server.use>[0]) {
  server.use(handler);
}

export function resetMSW() {
  server.resetHandlers(...handlers);
}