import * as StellarSDK from '@stellar/stellar-sdk';

import { checkNeedMoreGasFromError } from '@/components/GMPs';
import { estimateITSFee } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT, getChainData } from '@/lib/config';
import { formatUnits, isNumber, parseUnits, toBigNumber } from '@/lib/number';
import { sleep } from '@/lib/operator';
import { parseError } from '@/lib/parser';
import { headString } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';
import {
  getDefaultGasLimit,
  isAddGasSupported,
  isWalletConnectedForChain,
} from '../GMP.utils';
import { AddGasActionParams } from './AddGasButton.types';

/**
 * Determines if the Add Gas button should be shown based on transaction state
 */
export function shouldShowAddGasButton(
  data: GMPMessage | null,
  response: GMPToastState | null,
  chains: ChainMetadata[] | null
): boolean {
  if (!data?.call) return false;

  const { call, gas_paid, confirm, approved, executed, error, gas } = data;
  const sourceChainData = getChainData(call.chain, chains);

  // Must have source chain data and not be Axelar chain
  if (!sourceChainData || isAxelar(call.chain)) return false;

  // Check if add gas is supported for this chain
  if (!isAddGasSupported(call.chain, call.chain_type, chains)) return false;

  // Don't show if gas was just successfully added
  if (response?.message === 'Pay gas successful') return false;

  // Check if button should be shown based on transaction state
  const shouldShowForSelf =
    !executed &&
    !data.is_executed &&
    !approved &&
    !(confirm && !data.confirm_failed) &&
    (call.chain_type !== 'cosmos' ||
      (call.block_timestamp && timeDiff(call.block_timestamp * 1000) >= 60)) &&
    // no gas paid or not enough gas
    (!(gas_paid || data.gas_paid_to_callback) ||
      data.is_insufficient_fee ||
      data.is_invalid_gas_paid ||
      data.not_enough_gas_to_execute ||
      (gas?.gas_remain_amount !== undefined &&
        gas.gas_remain_amount < 0.000001));

  const shouldShowForCallback =
    data.callbackData &&
    (data.callbackData.is_insufficient_fee ||
      data.callbackData.not_enough_gas_to_execute ||
      checkNeedMoreGasFromError(data.callbackData.error)) &&
    data.callbackData.created_at &&
    typeof data.callbackData.created_at === 'object' &&
    'ms' in data.callbackData.created_at &&
    typeof data.callbackData.created_at.ms === 'number' &&
    timeDiff(data.callbackData.created_at.ms) > 60;

  const shouldShowForAxelarDestination =
    isAxelar(call.returnValues?.destinationChain) &&
    checkNeedMoreGasFromError(error);

  return (
    shouldShowForSelf || shouldShowForCallback || shouldShowForAxelarDestination
  );
}

/**
 * Execute the add gas action for a GMP transaction
 * Supports EVM, Cosmos, Sui, Stellar, and XRPL chains
 */
export async function executeAddGas(params: AddGasActionParams): Promise<void> {
  const {
    data,
    sdk,
    chains,
    provider,
    signer,
    address,
    cosmosWalletStore,
    suiWalletStore,
    stellarWalletStore,
    xrplWalletStore,
    estimatedGasUsed,
    setResponse,
    setProcessing,
    getData,
    approve,
    suiSignAndExecuteTransaction,
    xrplSignAndSubmitTransaction,
  } = params;

  if (
    !data?.call ||
    !sdk ||
    !isWalletConnectedForChain(data.call.chain, data.call.chain_type, chains, {
      cosmosWalletStore,
      signer,
      suiWalletStore,
      stellarWalletStore,
      xrplWalletStore,
    })
  ) {
    return;
  }

  setProcessing(true);
  setResponse({ status: 'pending', message: 'Adding gas...' });

  try {
    const {
      chain,
      chain_type,
      destination_chain_type,
      transactionHash,
      logIndex,
    } = { ...data.call };
    const { sender, destinationChain, messageId } = {
      ...data.call.returnValues,
    };
    const { base_fee, express_fee, source_token } = { ...data.fees };

    const sourceChainData = getChainData(chain, chains);
    let gasAddedAmount;

    // Calculate gas amount for Axelar destination (ITS transfers)
    if (isAxelar(destinationChain)) {
      let nextHopDestinationChain;

      if (data.interchain_transfer?.destinationChain) {
        nextHopDestinationChain = data.interchain_transfer.destinationChain;
      } else if (data.interchain_token_deployment_started?.destinationChain) {
        nextHopDestinationChain =
          data.interchain_token_deployment_started.destinationChain;
      } else if (data.link_token_started?.destinationChain) {
        nextHopDestinationChain = data.link_token_started.destinationChain;
      } else if (chain) {
        switch (headString(chain)) {
          case 'xrpl':
            if (chain.startsWith('xrpl-evm')) {
              nextHopDestinationChain =
                ENVIRONMENT === 'devnet-amplifier' ? 'xrpl-dev2' : 'xrpl';
            } else {
              nextHopDestinationChain =
                ENVIRONMENT === 'devnet-amplifier' ? 'xrpl-evm-2' : 'xrpl-evm';
            }
            break;
          default:
            nextHopDestinationChain =
              ENVIRONMENT === 'mainnet'
                ? 'ethereum'
                : ENVIRONMENT === 'devnet-amplifier'
                  ? 'eth-sepolia'
                  : 'ethereum-sepolia';
            break;
        }
      }

      const totalGasAmount = await estimateITSFee({
        sourceChain: chain,
        destinationChain: nextHopDestinationChain,
        sourceTokenSymbol: source_token?.symbol,
        gasLimit: getDefaultGasLimit(nextHopDestinationChain),
        gasMultiplier: 1.1,
        event: data.interchain_token_deployment_started
          ? 'InterchainTokenDeployment'
          : data.link_token_started
            ? 'LinkToken'
            : data.token_metadata_registered
              ? 'TokenMetadataRegistered'
              : undefined,
      });

      if (totalGasAmount) {
        gasAddedAmount = toBigNumber(totalGasAmount);
      }
    }

    if (!chain) {
      throw new Error('Chain is required for gas operations');
    }

    const gasLimit = isNumber(estimatedGasUsed) ? estimatedGasUsed : 700000;
    const decimals =
      source_token?.decimals || (headString(chain) === 'sui' ? 9 : 18);

    // Calculate default gas amount if not already calculated
    if (!gasAddedAmount) {
      const baseFee = base_fee ?? 0;
      const expressFee = express_fee ?? 0;
      const gasPrice = source_token?.gas_price ?? 0;

      gasAddedAmount = toBigNumber(
        BigInt(parseUnits((baseFee + expressFee) * 1.1, decimals)) +
          BigInt(parseUnits(gasLimit * gasPrice, decimals))
      );
    }

    // Handle EVM chains
    if (chain_type === 'evm' || isNumber(sourceChainData?.chain_id)) {
      console.log('[addGas request]', {
        chain,
        destinationChain,
        transactionHash,
        logIndex,
        estimatedGasUsed: gasLimit,
        refundAddress: address,
      });

      if (!chain || !transactionHash) {
        throw new Error('Missing required parameters for addNativeGas');
      }

      const response = await sdk.addNativeGas(
        chain,
        transactionHash,
        gasLimit,
        {
          evmWalletDetails: {
            useWindowEthereum: true,
            provider: provider ?? undefined,
          },
          destChain: destinationChain,
          logIndex,
          refundAddress: address ?? undefined,
        }
      );

      console.log('[addGas response]', response);

      const { success, error, transaction } = { ...response };

      if (success) {
        await sleep(1000);
      }

      setResponse({
        status: success ? 'success' : 'failed',
        message:
          parseError(error)?.message || String(error) || 'Pay gas successful',
        hash: transaction?.transactionHash,
        chain,
      });

      if (success) {
        const _data = await getData();

        if (
          _data &&
          chain_type !== 'vm' &&
          (destination_chain_type === 'cosmos'
            ? !data.executed && !_data.executed
            : !data.approved && !_data.approved)
        ) {
          await approve(_data, true);
        }
      }
    }
    // Handle Cosmos chains
    else if (chain_type === 'cosmos' && !isAxelar(chain)) {
      const token = 'autocalculate';

      if (
        !ENVIRONMENT ||
        !cosmosWalletStore.signer ||
        !chain ||
        !transactionHash ||
        !messageId
      ) {
        throw new Error('Missing required parameters for addGasToCosmosChain');
      }

      const sendOptions: {
        environment: string;
        offlineSigner: typeof cosmosWalletStore.signer;
        txFee: {
          gas: string;
          amount: Array<{ denom: string; amount: string }>;
        };
      } = {
        environment: ENVIRONMENT,
        offlineSigner: cosmosWalletStore.signer,
        txFee: {
          gas: '300000',
          amount: [
            {
              denom: String(sourceChainData?.native_token?.denom ?? 'uaxl'),
              amount: '30000',
            },
          ],
        },
      };

      console.log('[addGas request]', {
        chain,
        transactionHash,
        messageId,
        estimatedGasUsed: gasLimit,
        token,
        sendOptions,
      });

      const response = await sdk.addGasToCosmosChain({
        txHash: transactionHash,
        messageId,
        gasLimit,
        chain,
        token,
        sendOptions: sendOptions as never,
      } as never);

      console.log('[addGas response]', response);

      const { success, info, broadcastResult } = { ...response };

      if (success) {
        await sleep(1000);
      }

      setResponse({
        status: success ? 'success' : 'failed',
        message: info || 'Pay gas successful',
        hash: broadcastResult?.transactionHash,
        chain,
      });

      if (success && !broadcastResult?.code) {
        const _data = await getData();

        if (
          _data &&
          (destination_chain_type === 'cosmos'
            ? !data.executed && !_data.executed
            : !data.approved && !_data.approved)
        ) {
          await approve(_data, true);
        }
      }
    }
    // Handle Sui chain
    else if (headString(chain) === 'sui') {
      console.log('[addGas request]', {
        chain,
        messageId,
        gasAddedAmount,
        refundAddress: suiWalletStore.address,
      });

      if (!messageId || !suiWalletStore.address) {
        throw new Error('Missing required parameters for Sui gas addition');
      }

      const suiTransaction = await sdk.addGasToSuiChain({
        messageId,
        amount: gasAddedAmount,
        gasParams: '0x',
        refundAddress: suiWalletStore.address,
      });

      if (suiTransaction) {
        const suiResponse = await suiSignAndExecuteTransaction({
          transaction: suiTransaction as never,
          chain:
            `sui:${ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'}` as never,
        });

        console.log('[addGas response]', suiResponse);

        const suiEffectsStatus = (
          suiResponse as {
            effects?: { status?: { status?: string; error?: unknown } };
          }
        )?.effects?.status;

        setResponse({
          status: suiEffectsStatus?.status === 'success' ? 'success' : 'failed',
          message:
            parseError(suiEffectsStatus?.error)?.message ||
            'Pay gas successful',
          hash: (suiResponse as { digest?: string })?.digest,
          chain,
        });
      }
    }
    // Handle Stellar chain
    else if (headString(chain) === 'stellar') {
      console.log('[addGas request]', {
        chain,
        messageId,
        gasAddedAmount,
        refundAddress: stellarWalletStore.address,
      });

      if (!sender || !messageId || !stellarWalletStore.address) {
        throw new Error('Missing required parameters for Stellar gas addition');
      }

      const stellarTransactionXdr = await sdk.addGasToStellarChain({
        senderAddress: sender,
        messageId,
        amount: gasAddedAmount,
        spender: stellarWalletStore.address,
      });

      if (
        stellarTransactionXdr &&
        typeof stellarTransactionXdr === 'string' &&
        stellarWalletStore.provider &&
        stellarWalletStore.network &&
        stellarWalletStore.sorobanRpcUrl
      ) {
        const server = new StellarSDK.rpc.Server(
          sourceChainData?.endpoints?.rpc?.[0] ||
            stellarWalletStore.sorobanRpcUrl,
          { allowHttp: true }
        );

        const preparedTransaction = await server.prepareTransaction(
          StellarSDK.TransactionBuilder.fromXDR(
            stellarTransactionXdr,
            stellarWalletStore.network.networkPassphrase
          )
        );

        const signedResult = await stellarWalletStore.provider.signTransaction(
          preparedTransaction.toXDR()
        );

        if (signedResult?.signedTxXdr) {
          console.log('[stellar sendTransaction]', {
            ...signedResult,
            network: stellarWalletStore.network,
          });

          let stellarResponse:
            | StellarSDK.rpc.Api.SendTransactionResponse
            | undefined;
          let stellarError: string | undefined;

          try {
            stellarResponse = await server.sendTransaction(
              StellarSDK.TransactionBuilder.fromXDR(
                signedResult.signedTxXdr,
                stellarWalletStore.network.networkPassphrase
              )
            );

            if (stellarResponse.errorResult) {
              stellarError = JSON.parse(
                JSON.stringify(stellarResponse.errorResult)
              )?._attributes?.result?._switch?.name;
            }
          } catch (error) {
            stellarError = String(error);
          }

          console.log('[addGas response]', stellarResponse);

          setResponse({
            status:
              stellarError || stellarResponse?.status === 'ERROR'
                ? 'failed'
                : 'success',
            message:
              parseError(stellarError)?.message ||
              stellarError ||
              'Pay gas successful',
            hash: stellarResponse?.hash,
            chain,
          });
        }
      }
    }
    // Handle XRPL chain
    else if (headString(chain) === 'xrpl') {
      console.log('[addGas request]', {
        chain,
        messageId,
        gasAddedAmount: formatUnits(gasAddedAmount, decimals),
        refundAddress: xrplWalletStore.address,
      });

      if (!xrplWalletStore.address || !messageId) {
        throw new Error('Missing required parameters for XRPL gas addition');
      }

      const gasAddedAmountStr = formatUnits(gasAddedAmount, decimals);
      const xrplTransaction = await sdk.addGasToXrplChain({
        senderAddress: xrplWalletStore.address,
        messageId,
        amount:
          typeof gasAddedAmountStr === 'string'
            ? gasAddedAmountStr
            : String(gasAddedAmountStr),
      });

      if (xrplTransaction && typeof xrplTransaction === 'string') {
        const xrplResponse = await xrplSignAndSubmitTransaction(
          xrplTransaction as never,
          `xrpl:${ENVIRONMENT === 'mainnet' ? '0' : ENVIRONMENT === 'devnet-amplifier' ? '2' : '1'}` as never
        );

        console.log('[addGas response]', xrplResponse);

        const xrplResult = (
          xrplResponse as {
            result?: {
              meta?: { TransactionResult?: string };
              hash?: string;
            };
          }
        )?.result;

        setResponse({
          status:
            xrplResult?.meta?.TransactionResult === 'tesSUCCESS'
              ? 'success'
              : 'failed',
          message:
            parseError(xrplResult?.meta)?.message || 'Pay gas successful',
          hash: xrplResult?.hash,
          chain,
        });
      }
    }
  } catch (error) {
    setResponse({ status: 'failed', ...parseError(error) });
  }

  setProcessing(false);
}
