import * as StellarSDK from '@stellar/stellar-sdk';

import { estimateITSFee } from '@/lib/api/gmp';
import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT, getChainData } from '@/lib/config';
import { formatUnits, isNumber, parseUnits, toBigNumber } from '@/lib/number';
import { sleep } from '@/lib/operator';
import { parseError } from '@/lib/parser';
import { headString } from '@/lib/string';

import type { GMPMessage } from '../GMP.types';
import { getDefaultGasLimit, isWalletConnectedForChain } from '../GMP.utils';
import { AddGasActionParams } from './AddGasButton.types';

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

    if (chain_type === 'evm' || isNumber(sourceChainData?.chain_id)) {
      if (!transactionHash) {
        throw new Error('Missing required parameters for addNativeGas');
      }

      await handleEvmAddGas({
        sdk,
        data,
        chain,
        destinationChain,
        transactionHash,
        gasLimit,
        logIndex,
        refundAddress: address,
        provider,
        destinationChainType: destination_chain_type,
        setResponse,
        getData,
        approve,
      });
    } else if (chain_type === 'cosmos' && !isAxelar(chain)) {
      if (!messageId) {
        throw new Error('Missing required parameters for addGasToCosmosChain');
      }

      await handleCosmosAddGas({
        sdk,
        data,
        chain,
        transactionHash,
        messageId,
        gasLimit,
        sourceChainData,
        cosmosWalletStore,
        destinationChainType: destination_chain_type,
        setResponse,
        getData,
        approve,
      });
    } else if (headString(chain) === 'sui') {
      if (!messageId) {
        throw new Error('Missing required parameters for Sui gas addition');
      }

      await handleSuiAddGas({
        sdk,
        chain,
        messageId,
        gasAddedAmount,
        suiWalletStore,
        suiSignAndExecuteTransaction,
        setResponse,
      });
    } else if (headString(chain) === 'stellar') {
      if (!sender || !messageId || !stellarWalletStore.address) {
        throw new Error('Missing required parameters for Stellar gas addition');
      }

      await handleStellarAddGas({
        sdk,
        chain,
        messageId,
        gasAddedAmount,
        sender,
        stellarWalletStore,
        sourceChainData,
        setResponse,
      });
    } else if (headString(chain) === 'xrpl') {
      if (!messageId) {
        throw new Error('Missing required parameters for XRPL gas addition');
      }

      await handleXrplAddGas({
        sdk,
        chain,
        messageId,
        gasAddedAmount,
        decimals,
        xrplWalletStore,
        xrplSignAndSubmitTransaction,
        setResponse,
      });
    }
  } catch (error) {
    setResponse({ status: 'failed', ...parseError(error) });
  }

  setProcessing(false);
}

type NonNullableSdk = NonNullable<AddGasActionParams['sdk']>;
type NonNullableProvider = AddGasActionParams['provider'];
type NonNullableResponseSetter = AddGasActionParams['setResponse'];
type NonNullableApprove = AddGasActionParams['approve'];
type NonNullableGetData = AddGasActionParams['getData'];

interface BaseHandlerParams {
  sdk: NonNullableSdk;
  chain: string;
  setResponse: NonNullableResponseSetter;
}

interface DataAwareHandlerParams extends BaseHandlerParams {
  data: GMPMessage;
}

interface EvmHandlerParams extends DataAwareHandlerParams {
  destinationChain: string | undefined;
  transactionHash: string;
  gasLimit: number;
  logIndex: number | undefined;
  refundAddress: string | null;
  provider: NonNullableProvider;
  destinationChainType: string | undefined;
  getData: NonNullableGetData;
  approve: NonNullableApprove;
}

async function handleEvmAddGas({
  sdk,
  data,
  chain,
  destinationChain,
  transactionHash,
  gasLimit,
  logIndex,
  refundAddress,
  provider,
  destinationChainType,
  setResponse,
  getData,
  approve,
}: EvmHandlerParams): Promise<void> {
  console.log('[addGas request]', {
    chain,
    destinationChain,
    transactionHash,
    logIndex,
    estimatedGasUsed: gasLimit,
    refundAddress,
  });

  const response = await sdk.addNativeGas(chain, transactionHash, gasLimit, {
    evmWalletDetails: {
      useWindowEthereum: true,
      provider: provider ?? undefined,
    },
    destChain: destinationChain,
    logIndex,
    refundAddress: refundAddress ?? undefined,
  });

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

  if (!success) {
    return;
  }

  const updatedData = await getData();
  const call = data.call;
  const chainType = call?.chain_type;
  const targetDestinationChainType =
    destinationChainType ?? call?.destination_chain_type;

  if (
    updatedData &&
    chainType !== 'vm' &&
    (targetDestinationChainType === 'cosmos'
      ? !data.executed && !updatedData.executed
      : !data.approved && !updatedData.approved)
  ) {
    await approve(updatedData, true);
  }
}

interface CosmosHandlerParams extends DataAwareHandlerParams {
  transactionHash: string | undefined;
  messageId: string;
  gasLimit: number;
  sourceChainData: ReturnType<typeof getChainData>;
  cosmosWalletStore: NonNullable<AddGasActionParams['cosmosWalletStore']>;
  destinationChainType: string | undefined;
  getData: NonNullableGetData;
  approve: NonNullableApprove;
}

async function handleCosmosAddGas({
  sdk,
  data,
  chain,
  transactionHash,
  messageId,
  gasLimit,
  sourceChainData,
  cosmosWalletStore,
  destinationChainType,
  setResponse,
  getData,
  approve,
}: CosmosHandlerParams): Promise<void> {
  if (!ENVIRONMENT || !cosmosWalletStore.signer || !transactionHash) {
    throw new Error('Missing required parameters for addGasToCosmosChain');
  }

  const token = 'autocalculate';
  const sendOptions = {
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

  if (!success || broadcastResult?.code) {
    return;
  }

  const updatedData = await getData();

  if (
    updatedData &&
    (destinationChainType === 'cosmos'
      ? !data.executed && !updatedData.executed
      : !data.approved && !updatedData.approved)
  ) {
    await approve(updatedData, true);
  }
}

interface SuiHandlerParams extends BaseHandlerParams {
  messageId: string;
  gasAddedAmount: string;
  suiWalletStore: NonNullable<AddGasActionParams['suiWalletStore']>;
  suiSignAndExecuteTransaction: AddGasActionParams['suiSignAndExecuteTransaction'];
}

async function handleSuiAddGas({
  sdk,
  chain,
  messageId,
  gasAddedAmount,
  suiWalletStore,
  suiSignAndExecuteTransaction,
  setResponse,
}: SuiHandlerParams): Promise<void> {
  console.log('[addGas request]', {
    chain,
    messageId,
    gasAddedAmount,
    refundAddress: suiWalletStore.address,
  });

  if (!suiWalletStore.address) {
    throw new Error('Missing required parameters for Sui gas addition');
  }

  const suiTransaction = await sdk.addGasToSuiChain({
    messageId,
    amount: gasAddedAmount,
    gasParams: '0x',
    refundAddress: suiWalletStore.address,
  });

  if (!suiTransaction) {
    return;
  }

  const suiResponse = await suiSignAndExecuteTransaction({
    transaction: suiTransaction as never,
    chain: `sui:${ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'}` as never,
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
      parseError(suiEffectsStatus?.error)?.message || 'Pay gas successful',
    hash: (suiResponse as { digest?: string })?.digest,
    chain,
  });
}

interface StellarHandlerParams extends BaseHandlerParams {
  messageId: string;
  gasAddedAmount: string;
  sender: string;
  stellarWalletStore: NonNullable<AddGasActionParams['stellarWalletStore']>;
  sourceChainData: ReturnType<typeof getChainData>;
}

async function handleStellarAddGas({
  sdk,
  chain,
  messageId,
  gasAddedAmount,
  sender,
  stellarWalletStore,
  sourceChainData,
  setResponse,
}: StellarHandlerParams): Promise<void> {
  console.log('[addGas request]', {
    chain,
    messageId,
    gasAddedAmount,
    refundAddress: stellarWalletStore.address,
  });

  const spenderAddress = stellarWalletStore.address;

  if (!spenderAddress) {
    throw new Error('Missing required parameters for Stellar gas addition');
  }

  const stellarTransactionXdr = await sdk.addGasToStellarChain({
    senderAddress: sender,
    messageId,
    amount: gasAddedAmount,
    spender: spenderAddress,
  });

  if (
    !stellarTransactionXdr ||
    typeof stellarTransactionXdr !== 'string' ||
    !stellarWalletStore.provider ||
    !stellarWalletStore.network ||
    !stellarWalletStore.sorobanRpcUrl
  ) {
    return;
  }

  const networkPassphrase = stellarWalletStore.network.networkPassphrase!;

  const server = new StellarSDK.rpc.Server(
    sourceChainData?.endpoints?.rpc?.[0] || stellarWalletStore.sorobanRpcUrl,
    { allowHttp: true }
  );

  const preparedTransaction = await server.prepareTransaction(
    StellarSDK.TransactionBuilder.fromXDR(
      stellarTransactionXdr,
      networkPassphrase
    )
  );

  const signedResult = await stellarWalletStore.provider.signTransaction!(
    preparedTransaction.toXDR()
  );

  if (!signedResult?.signedTxXdr) {
    return;
  }

  console.log('[stellar sendTransaction]', {
    ...signedResult,
    network: stellarWalletStore.network,
  });

  let stellarResponse: StellarSDK.rpc.Api.SendTransactionResponse | undefined;
  let stellarError: string | undefined;

  try {
    stellarResponse = await server.sendTransaction(
      StellarSDK.TransactionBuilder.fromXDR(
        signedResult.signedTxXdr,
        networkPassphrase
      )
    );

    if (stellarResponse?.errorResult) {
      stellarError = JSON.parse(JSON.stringify(stellarResponse.errorResult))
        ?._attributes?.result?._switch?.name;
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
      parseError(stellarError)?.message || stellarError || 'Pay gas successful',
    hash: stellarResponse?.hash,
    chain,
  });
}

interface XrplHandlerParams extends BaseHandlerParams {
  messageId: string;
  gasAddedAmount: string;
  decimals: number;
  xrplWalletStore: NonNullable<AddGasActionParams['xrplWalletStore']>;
  xrplSignAndSubmitTransaction: AddGasActionParams['xrplSignAndSubmitTransaction'];
}

async function handleXrplAddGas({
  sdk,
  chain,
  messageId,
  gasAddedAmount,
  decimals,
  xrplWalletStore,
  xrplSignAndSubmitTransaction,
  setResponse,
}: XrplHandlerParams): Promise<void> {
  console.log('[addGas request]', {
    chain,
    messageId,
    gasAddedAmount: formatUnits(gasAddedAmount, decimals),
    refundAddress: xrplWalletStore.address,
  });

  if (!xrplWalletStore.address) {
    throw new Error('Missing required parameters for XRPL gas addition');
  }

  const formattedXrplAmount = String(formatUnits(gasAddedAmount, decimals));
  const xrplTransaction = await sdk.addGasToXrplChain({
    senderAddress: xrplWalletStore.address,
    messageId,
    amount: formattedXrplAmount,
  });

  if (!xrplTransaction || typeof xrplTransaction !== 'string') {
    return;
  }

  const xrplResponse = await xrplSignAndSubmitTransaction(
    xrplTransaction as never,
    `xrpl:${getXrplNetworkCode()}` as never
  );

  console.log('[addGas response]', xrplResponse);

  const { tx_hash: txHash, tx_json: txJson } = xrplResponse;
  const xrplError = (xrplResponse as { error?: unknown })?.error;
  const transactionMeta =
    typeof txJson?.meta === 'object' && txJson.meta !== null
      ? txJson.meta
      : undefined;
  const transactionResult =
    transactionMeta && 'TransactionResult' in transactionMeta
      ? transactionMeta.TransactionResult
      : undefined;
  const status = transactionResult === 'tesSUCCESS' ? 'success' : 'failed';
  const parsedXrplError = parseError(xrplError)?.message;
  const errorMessage =
    typeof xrplError === 'string' ? xrplError : parsedXrplError;
  const message =
    errorMessage ||
    (status === 'success'
      ? 'Pay gas successful'
      : transactionResult || 'Pay gas failed');

  setResponse({
    status,
    message,
    hash: txHash,
    chain,
  });
}

const getXrplNetworkCode = (): '0' | '1' | '2' => {
  if (ENVIRONMENT === 'mainnet') {
    return '0';
  }

  if (ENVIRONMENT === 'devnet-amplifier') {
    return '2';
  }

  return '1';
};
