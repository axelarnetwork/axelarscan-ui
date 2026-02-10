/**
 * @jest-environment node
 */
import { normalizeRecoveryBytes } from './GMP.recovery.utils';

describe('normalizeRecoveryBytes', () => {
  it('converts numeric-key object payload to Uint8Array', () => {
    const payload = { 0: 10, 1: 141, 2: 1, 3: 255 };
    const result = normalizeRecoveryBytes(payload);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result ?? [])).toEqual([10, 141, 1, 255]);
  });

  it('converts array payload to Uint8Array', () => {
    const payload = [10, 20, 30];
    const result = normalizeRecoveryBytes(payload);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result ?? [])).toEqual([10, 20, 30]);
  });

  it('passes through Uint8Array unchanged', () => {
    const payload = new Uint8Array([7, 8, 9]);
    const result = normalizeRecoveryBytes(payload);
    expect(result).toBe(payload);
  });

  it('returns null for invalid payload', () => {
    const payload = { a: 1, b: 2 };
    const result = normalizeRecoveryBytes(payload);
    expect(result).toBeNull();
  });
});
