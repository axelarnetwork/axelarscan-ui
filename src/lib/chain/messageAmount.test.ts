/**
 * @jest-environment node
 */
import type { Asset } from '@/types';
import { resolveMessageAmount } from './messageAmount';

const registry = [
  { id: 'uaxl', denom: 'uaxl', symbol: 'AXL', decimals: 6 },
] as unknown as Asset[];

describe('resolveMessageAmount', () => {
  it('converts a known denom with the registry precision', () => {
    expect(
      resolveMessageAmount({ denom: 'uaxl', amount: '1' }, registry)
    ).toEqual({ value: 0.000001, suffix: 'AXL' });
  });

  it('shows no unit while the registry is still loading', () => {
    // Rendering the raw denom here would swap to "AXL" a moment later.
    expect(resolveMessageAmount({ denom: 'uaxl', amount: '1' }, null)).toEqual({
      value: 0.000001,
      suffix: undefined,
    });
  });

  it('does not convert a denom the registry does not know', () => {
    // transfer/channel-0/unit-zig is an 18 decimal token. Assuming 6 would
    // print 500,000,000,000 instead of 0.5.
    expect(
      resolveMessageAmount(
        { denom: 'transfer/channel-0/unit-zig', amount: '500000000000000000' },
        registry
      )
    ).toEqual({
      raw: '500000000000000000',
      suffix: 'transfer/channel-0/unit-zig',
    });
  });

  it('never returns both a converted and a raw figure', () => {
    for (const [amount, assets] of [
      [{ denom: 'uaxl', amount: '5' }, registry],
      [{ denom: 'uaxl', amount: '5' }, null],
      [{ denom: 'nope', amount: '5' }, registry],
    ] as const) {
      const { value, raw } = resolveMessageAmount(amount, assets);
      expect(value === undefined || raw === undefined).toBe(true);
    }
  });
});
