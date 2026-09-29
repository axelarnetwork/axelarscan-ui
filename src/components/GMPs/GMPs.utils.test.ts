/**
 * @jest-environment node
 */
import { getDisplayStatus, getStatusLabel } from './GMPs.utils';
import type { EventDataInput } from './GMPs.types';

const evmCall = {
  event: 'ContractCall',
  chain: 'ethereum',
  chain_type: 'evm',
  destination_chain_type: 'evm',
  returnValues: { destinationChain: 'avalanche' },
};

const cosmosCall = {
  event: 'ContractCall',
  chain: 'osmosis',
  chain_type: 'cosmos',
  destination_chain_type: 'cosmos',
  returnValues: { destinationChain: 'neutron' },
};

describe('getDisplayStatus', () => {
  it('keeps sent for an EVM call without confirmation', () => {
    const d: EventDataInput = {
      call: evmCall,
      status: 'called',
      simplified_status: 'sent',
    };
    expect(getDisplayStatus(d)).toBe('sent');
  });

  it('shows confirmed for an EVM call confirmed but not approved', () => {
    const d: EventDataInput = {
      call: evmCall,
      status: 'confirmed',
      simplified_status: 'sent',
    };
    expect(getDisplayStatus(d)).toBe('confirmed');
  });

  it('shows confirmed for a VM call confirmed but not approved', () => {
    const d: EventDataInput = {
      call: { ...evmCall, chain: 'stellar', chain_type: 'vm' },
      status: 'confirmed',
      simplified_status: 'sent',
    };
    expect(getDisplayStatus(d)).toBe('confirmed');
  });

  it('shows confirmed for a Cosmos call before approval', () => {
    const d: EventDataInput = {
      call: { ...cosmosCall, destination_chain_type: 'evm' },
      status: 'called',
      simplified_status: 'sent',
    };
    expect(getDisplayStatus(d)).toBe('confirmed');
  });

  it('shows confirmed for an Axelar call before approval', () => {
    const d: EventDataInput = {
      call: { ...evmCall, chain: 'axelarnet', chain_type: undefined },
      status: 'called',
      simplified_status: 'sent',
    };
    expect(getDisplayStatus(d)).toBe('confirmed');
  });

  it('keeps approved for a Cosmos destination without an approval event', () => {
    const d: EventDataInput = {
      call: cosmosCall,
      status: 'executing',
      simplified_status: 'approved',
    };
    expect(getDisplayStatus(d)).toBe('approved');
  });

  it('keeps approved when an approval event exists', () => {
    const d: EventDataInput = {
      call: evmCall,
      approved: { transactionHash: '0x1' },
      status: 'approved',
      simplified_status: 'approved',
    };
    expect(getDisplayStatus(d)).toBe('approved');
  });

  it('returns an empty string without a simplified status', () => {
    expect(getDisplayStatus({ call: evmCall })).toBe('');
  });

  it('keeps received and failed', () => {
    expect(
      getDisplayStatus({ call: cosmosCall, simplified_status: 'received' })
    ).toBe('received');
    expect(
      getDisplayStatus({ call: cosmosCall, simplified_status: 'failed' })
    ).toBe('failed');
  });
});

describe('getStatusLabel', () => {
  it('shows Executed for a received ContractCall', () => {
    const d: EventDataInput = {
      call: evmCall,
      approved: { transactionHash: '0x1' },
      status: 'executed',
      simplified_status: 'received',
    };
    expect(getStatusLabel(d)).toBe('Executed');
  });

  it('uses the display status otherwise', () => {
    const d: EventDataInput = {
      call: evmCall,
      status: 'confirmed',
      simplified_status: 'sent',
    };
    expect(getStatusLabel(d)).toBe('confirmed');
  });
});
