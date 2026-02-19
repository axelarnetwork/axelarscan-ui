/**
 * @jest-environment node
 */
import type { AxelarGMPRecoveryAPI } from '@axelar-network/axelarjs-sdk';
import type { providers } from 'ethers';

import { executeApprove } from './ApproveButton.utils';
import type { KeplrSigner } from '@/types/cosmos';
import type { GMPMessage } from '../GMP.types';

jest.mock('@/lib/operator', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

const createMessage = (
  overrides?: Partial<NonNullable<GMPMessage['call']>>
): GMPMessage => ({
  call: {
    chain: 'Ethereum',
    chain_type: 'evm',
    destination_chain_type: 'cosmos',
    transactionHash: '0xtx',
    logIndex: 1,
    eventIndex: 2,
    message_id: 'message-id',
    ...overrides,
  },
});

describe('executeApprove', () => {
  it('uses self-signing when cosmos signer is connected', async () => {
    const manualRelayToDestChain = jest.fn().mockResolvedValue({
      success: true,
      routeMessageTx: { transactionHash: '0xroute' },
    });
    const setResponse = jest.fn();
    const setProcessing = jest.fn();
    const signer = {
      getAccounts: jest.fn(),
      signAmino: jest.fn(),
      signDirect: jest.fn(),
    } as unknown as KeplrSigner;

    await executeApprove({
      data: createMessage(),
      sdk: {
        manualRelayToDestChain,
      } as unknown as AxelarGMPRecoveryAPI,
      provider: {} as providers.Web3Provider,
      cosmosSigner: signer,
      setResponse,
      setProcessing,
    });

    expect(manualRelayToDestChain).toHaveBeenCalledTimes(1);
    expect(manualRelayToDestChain).toHaveBeenCalledWith('0xtx', 1, 2, {
      evmWalletDetails: {
        useWindowEthereum: true,
        provider: expect.any(Object),
      },
      escapeAfterConfirm: false,
      messageId: 'message-id',
      selfSigning: {
        cosmosWalletDetails: {
          offlineSigner: signer,
        },
      },
    });
    expect(setProcessing).toHaveBeenCalledWith(true);
    expect(setProcessing).toHaveBeenLastCalledWith(false);
  });

  it('fails in UI and does not call SDK when cosmos signer is not connected', async () => {
    const manualRelayToDestChain = jest.fn().mockResolvedValue({
      success: true,
      routeMessageTx: { transactionHash: '0xroute' },
    });
    const setResponse = jest.fn();
    const setProcessing = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await executeApprove({
      data: createMessage(),
      sdk: {
        manualRelayToDestChain,
      } as unknown as AxelarGMPRecoveryAPI,
      provider: {} as providers.Web3Provider,
      cosmosSigner: null,
      setResponse,
      setProcessing,
    });

    expect(manualRelayToDestChain).not.toHaveBeenCalled();
    expect(setResponse).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'failed',
        message: 'Connect a Cosmos wallet to continue',
      })
    );
    expect(errorSpy).toHaveBeenCalledWith(
      '[recovery missing cosmos signer]',
      expect.objectContaining({
        use_self_signing: false,
      })
    );
    expect(setProcessing).toHaveBeenCalledWith(true);
    expect(setProcessing).toHaveBeenLastCalledWith(false);

    errorSpy.mockRestore();
  });

  it('proceeds without EVM provider when cosmos signer is connected', async () => {
    const manualRelayToDestChain = jest.fn().mockResolvedValue({
      success: true,
      routeMessageTx: { transactionHash: '0xroute' },
    });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await executeApprove({
      data: createMessage({
        chain_type: 'cosmos',
        destination_chain_type: 'cosmos',
      }),
      sdk: {
        manualRelayToDestChain,
      } as unknown as AxelarGMPRecoveryAPI,
      provider: null,
      cosmosSigner: {
        getAccounts: jest.fn(),
        signAmino: jest.fn(),
        signDirect: jest.fn(),
      } as unknown as KeplrSigner,
      setResponse: jest.fn(),
      setProcessing: jest.fn(),
    });

    expect(manualRelayToDestChain).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('shows a failure message when response is unsuccessful without error', async () => {
    const manualRelayToDestChain = jest.fn().mockResolvedValue({
      success: false,
    });
    const setResponse = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await executeApprove({
      data: createMessage(),
      sdk: {
        manualRelayToDestChain,
      } as unknown as AxelarGMPRecoveryAPI,
      provider: {} as providers.Web3Provider,
      cosmosSigner: {
        getAccounts: jest.fn(),
        signAmino: jest.fn(),
        signDirect: jest.fn(),
      } as unknown as KeplrSigner,
      setResponse,
      setProcessing: jest.fn(),
    });

    expect(setResponse).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'failed',
        message: 'Recovery failed',
      })
    );
    expect(errorSpy).toHaveBeenCalledWith(
      '[recovery unexpected response]',
      expect.objectContaining({
        response: { success: false },
      })
    );

    errorSpy.mockRestore();
  });
});
