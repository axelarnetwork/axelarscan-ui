/**
 * @jest-environment node
 */
// Avoid pulling the @/components/GMPs barrel (which transitively imports image
// assets Jest can't transform). RecoveryButtons.utils only uses
// checkNeedMoreGasFromError from it, and these fixtures never set an error.
jest.mock('@/components/GMPs', () => ({
  checkNeedMoreGasFromError: () => false,
}));

import { shouldShowAddGasButton } from './RecoveryButtons.utils';
import type { ChainMetadata, GMPMessage } from '../GMP.types';

// Minimal chain metadata so getChainData() resolves the source chain.
const chains = [{ id: 'ethereum', chain_id: 1 }] as unknown as ChainMetadata[];

// A message that has paid gas and is sitting in the "Waiting for Finality"
// stage (no confirm/approved/executed yet) on an EVM source chain.
const createMessage = (overrides?: Partial<GMPMessage>): GMPMessage => ({
  call: {
    chain: 'ethereum',
    chain_type: 'evm',
    destination_chain_type: 'evm',
    transactionHash: '0xtx',
    logIndex: 1,
    eventIndex: 2,
    message_id: 'message-id',
  },
  gas_paid: {} as GMPMessage['gas_paid'],
  ...overrides,
});

describe('shouldShowAddGasButton — Waiting for Finality (MEL-48)', () => {
  it('does NOT show Add Gas when gas is paid and only gas_remain_amount is near zero', () => {
    // Regression: a correctly funded message can legitimately have ~0 gas
    // remaining (no refund expected) while waiting for finality. The old
    // gas_remain_amount < 0.000001 heuristic surfaced the button here even
    // though the transaction goes on to complete normally.
    const data = createMessage({
      gas: { gas_remain_amount: 0 } as GMPMessage['gas'],
    });

    expect(shouldShowAddGasButton(data, null, chains)).toBe(false);
  });

  it('still shows Add Gas when no gas was paid', () => {
    const data = createMessage({ gas_paid: undefined });

    expect(shouldShowAddGasButton(data, null, chains)).toBe(true);
  });

  it('still shows Add Gas when the backend flags an insufficient fee', () => {
    const data = createMessage({
      gas: { gas_remain_amount: 0 } as GMPMessage['gas'],
      is_insufficient_fee: true,
    });

    expect(shouldShowAddGasButton(data, null, chains)).toBe(true);
  });

  it('still shows Add Gas when the backend flags invalid gas paid', () => {
    const data = createMessage({
      gas: { gas_remain_amount: 0 } as GMPMessage['gas'],
      is_invalid_gas_paid: true,
    });

    expect(shouldShowAddGasButton(data, null, chains)).toBe(true);
  });

  it('still shows Add Gas when the backend flags not enough gas to execute', () => {
    const data = createMessage({
      gas: { gas_remain_amount: 0 } as GMPMessage['gas'],
      not_enough_gas_to_execute: true,
    });

    expect(shouldShowAddGasButton(data, null, chains)).toBe(true);
  });
});
