import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('should return health status successfully', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/api/health', {
      method: 'GET',
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    
    expect(data.status).toBe('ok');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.uptime).toBe('number');
    
    // Verify timestamp is a valid ISO date
    expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    expect(isNaN(new Date(data.timestamp).getTime())).toBe(false);
  });

  it('should have correct response headers', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/api/health', {
      method: 'GET',
    });

    // Act
    const response = await GET(request);

    // Assert
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
  });

  it('should return consistent status format', async () => {
    // Arrange
    const request = new Request('http://localhost:3000/api/health', {
      method: 'GET',
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert - Check the exact structure expected
    expect(data).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
    });
  });

  it('should return different uptime values on subsequent calls', async () => {
    // Arrange
    const request1 = new Request('http://localhost:3000/api/health', {
      method: 'GET',
    });
    const request2 = new Request('http://localhost:3000/api/health', {
      method: 'GET',
    });

    // Act
    const response1 = await GET(request1);
    const data1 = await response1.json();
    
    // Small delay to ensure different uptime
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const response2 = await GET(request2);
    const data2 = await response2.json();

    // Assert
    expect(data2.uptime).toBeGreaterThanOrEqual(data1.uptime);
    expect(new Date(data2.timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(data1.timestamp).getTime()
    );
  });
});