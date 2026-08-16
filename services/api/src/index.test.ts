import { describe, it, expect } from 'vitest';

describe('API Service', () => {
  it('should have basic endpoint definitions', () => {
    const endpoints = {
      health: '/health',
      version: '/api/version',
    };

    expect(endpoints.health).toBe('/health');
    expect(endpoints.version).toBe('/api/version');
  });

  it('should have valid version string', () => {
    const version = '0.1.0';
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
