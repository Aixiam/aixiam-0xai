// src/shared/ipfs-client/src/index.test.ts
import { greet, CustomClient } from './index';

describe('VersoriumX IPFS Client', () => {
  it('should greet correctly', () => {
    expect(greet('World')).toBe('Hello, World from VersoriumX IPFS Client!');
  });

  it('should initialize CustomClient with keys', () => {
    const client = new CustomClient('APIKEY123', 'SECRETKEYABC');
    expect(client.ping()).toContain('Client active');
  });

  it('should throw error if keys are missing', () => {
    expect(() => new CustomClient('', 'SECRETKEYABC')).toThrow('API Key and Secret Key are required.');
  });
});
