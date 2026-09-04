/**
 * @jest-environment node
 */
import type { Asset } from '@/types';
import { resolveMessageAmount } from './messageAmount';

// Shapes taken from the live registry.
const registry = [
  { id: 'uaxl', denom: 'uaxl', symbol: 'AXL', decimals: 6 },
  { id: 'uusdc', denom: 'uusdc', symbol: 'USDC', decimals: 6 },
  { id: 'unit-zig', denom: 'unit-zig', symbol: 'ZIG', decimals: 18 },
] as unknown as Asset[];

describe('resolveMessageAmount', () => {
  it('converts a plain denom with the registry precision', () => {
    expect(
      resolveMessageAmount({ denom: 'uaxl', amount: '3999595000549' }, registry)
    ).toEqual({ value: 3999595.000549, suffix: 'AXL' });
  });

  it('resolves an IBC trace path through its base denom', () => {
    // 98 of 100 recent received packets name the token this way. Failing to
    // reduce the path left every one of them unconverted.
    expect(
      resolveMessageAmount(
        { denom: 'transfer/channel-208/uusdc', amount: '30371' },
        registry
      )
    ).toEqual({ value: 0.030371, suffix: 'USDC' });
  });

  it('uses the base denom precision, not a guess', () => {
    // ZIG is 18 decimals. Assuming 6 would print 500,000,000,000.
    expect(
      resolveMessageAmount(
        { denom: 'transfer/channel-0/unit-zig', amount: '500000000000000000' },
        registry
      )
    ).toEqual({ value: 0.5, suffix: 'ZIG' });
  });

  it('shows the raw integer rather than a guessed conversion while loading', () => {
    // Converting at an assumed 6 decimals here is how an 18 decimal token came
    // out a million times too large before it settled.
    expect(
      resolveMessageAmount(
        { denom: 'transfer/channel-0/unit-zig', amount: '500000000000000000' },
        null
      )
    ).toEqual({ raw: '500000000000000000', suffix: undefined });
  });

  it('shows the raw integer for a denom the registry does not know', () => {
    expect(
      resolveMessageAmount(
        { denom: 'transfer/channel-9/unew', amount: '7' },
        registry
      )
    ).toEqual({ raw: '7', suffix: 'transfer/channel-9/unew' });
  });

  it('returns exactly one of a converted or a raw figure', () => {
    for (const [amount, assets] of [
      [{ denom: 'uaxl', amount: '5' }, registry],
      [{ denom: 'uaxl', amount: '5' }, null],
      [{ denom: 'nope', amount: '5' }, registry],
      [{ denom: 'transfer/channel-1/uusdc', amount: '5' }, registry],
    ] as const) {
      const { value, raw } = resolveMessageAmount(amount, assets);
      expect([value, raw].filter(v => v !== undefined)).toHaveLength(1);
    }
  });
});
