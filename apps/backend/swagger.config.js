const { getVersion, getDisplayName, getDescription } = require('@boilerplate/config/project.config');

module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${getDisplayName()} API`,
      version: getVersion(),
      description: `API documentation for ${getDescription()}`,
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? (process.env.API_URL || 'https://api.boilerplate.lumineau.app')
          : (process.env.API_URL || 'http://localhost:3101'),
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server'
          : 'Development server',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
          },
          required: ['error'],
        },
        Health: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok'],
              description: 'Service status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
            },
            version: {
              type: 'string',
              description: 'API version',
            },
          },
          required: ['status', 'timestamp'],
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
          required: ['id', 'email'],
        },
        Session: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Session token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Session expiration timestamp',
            },
          },
          required: ['token', 'user'],
        },
      },
      securitySchemes: {
        SessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
          description: 'Session cookie authentication',
        },
      },
    },
    security: [
      {
        SessionCookie: [],
      },
    ],
  },
  apis: [
    './app/api/**/*.ts',
    './app/api/**/*.js',
  ],
}