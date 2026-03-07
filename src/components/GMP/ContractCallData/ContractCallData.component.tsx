import { MdKeyboardArrowRight } from 'react-icons/md';

import { useChains, useAssets } from '@/hooks/useGlobalData';
import { ChainProfile } from '@/components/Profile';
import { isAxelar } from '@/lib/chain';
import { getAssetData, getChainData } from '@/lib/config';
import { toCase } from '@/lib/parser';

import { AssetAddressEntry, AssetDataEntry } from '../GMP.types';
import { contractCallDataStyles } from './ContractCallData.styles';
import { ContractCallDataProps } from './ContractCallData.types';
import { DataField } from './DataField.component';
import { MultihopStatus } from './MultihopStatus.component';

function resolveDestinationAssetConfig(
  destinationChain: string | undefined,
  assetAddresses: Record<string, AssetAddressEntry | undefined> | undefined,
): AssetAddressEntry | undefined {
  if (!assetAddresses || !destinationChain) return undefined;

  const key = toCase(destinationChain, 'lower');
  if (typeof key !== 'string') return undefined;

  return assetAddresses[key];
}

export function ContractCallData({
  data,
  executeData,
  isMultihop,
}: ContractCallDataProps) {
  const chains = useChains();
  const assets = useAssets();

  if (!data) return null;

  const { call, approved } = data;

  const sourceChain =
    approved?.returnValues?.sourceChain ||
    (isAxelar(call?.chain)
      ? call?.chain
      : getChainData(call?.chain, chains)?.chain_name || call?.chain);
  const destinationChain =
    call?.returnValues?.destinationChain ||
    getChainData(approved?.chain, chains)?.chain_name ||
    approved?.chain;

  const symbol =
    call?.returnValues?.symbol ||
    data.interchain_transfer?.symbol ||
    data.token_manager_deployment_started?.symbol ||
    data.interchain_token_deployment_started?.tokenSymbol ||
    data.link_token_started?.symbol ||
    data.token_metadata_registered?.symbol;

  const assetEntry = getAssetData(symbol, assets) as AssetDataEntry | undefined;
  const destinationAssetConfig = resolveDestinationAssetConfig(
    destinationChain,
    assetEntry?.addresses,
  );

  const messageId = data.message_id;
  const commandId = approved?.returnValues?.commandId || data.command_id;
  const sourceAddress = call?.returnValues?.sender;
  const destinationContractAddress =
    approved?.returnValues?.contractAddress ||
    call?.returnValues?.destinationContractAddress;
  const payloadHash = call?.returnValues?.payloadHash;
  const payload = call?.returnValues?.payload;
  const sourceSymbol = call?.returnValues?.symbol;
  const destinationSymbol =
    approved?.returnValues?.symbol ||
    destinationAssetConfig?.symbol ||
    sourceSymbol;
  const amountInUnits =
    approved?.returnValues?.amount || call?.returnValues?.amount;

  return (
    <div className={contractCallDataStyles.container}>
      <dl className={contractCallDataStyles.list}>
        <div className={contractCallDataStyles.section}>
          <dd className={contractCallDataStyles.value}>
            <div className={contractCallDataStyles.chainRow}>
              <ChainProfile
                value={sourceChain}
                width={20}
                height={20}
                className={contractCallDataStyles.chainProfileIcon}
                titleClassName={contractCallDataStyles.chainTitle}
              />
              <MdKeyboardArrowRight size={20} />
              <ChainProfile
                value={destinationChain}
                width={20}
                height={20}
                className={contractCallDataStyles.chainProfileIcon}
                titleClassName={contractCallDataStyles.chainTitle}
              />
            </div>
          </dd>
        </div>
        {isMultihop && <MultihopStatus data={data} />}
        {messageId && <DataField label="messageId" value={messageId} />}
        {commandId && <DataField label="commandId" value={commandId} />}
        {sourceChain && (
          <DataField
            label="sourceChain"
            value={sourceChain}
            textClassName={contractCallDataStyles.chainLabel}
          />
        )}
        {destinationChain && (
          <DataField
            label="destinationChain"
            value={destinationChain}
            textClassName={contractCallDataStyles.chainLabel}
          />
        )}
        {sourceAddress && <DataField label="sourceAddress" value={sourceAddress} />}
        {destinationContractAddress && (
          <DataField label="destinationContractAddress" value={destinationContractAddress} />
        )}
        {payloadHash && <DataField label="payloadHash" value={payloadHash} />}
        {payload && <DataField label="payload" value={payload} />}
        {sourceSymbol && (
          <DataField
            label="sourceSymbol"
            value={sourceSymbol}
            textClassName={contractCallDataStyles.chainLabel}
          />
        )}
        {destinationSymbol && (
          <DataField
            label="destinationSymbol"
            value={destinationSymbol}
            textClassName={contractCallDataStyles.chainLabel}
          />
        )}
        {amountInUnits && (
          <DataField
            label="amount"
            value={amountInUnits}
            textClassName={contractCallDataStyles.chainLabel}
          />
        )}
        {executeData && <DataField label="executeData" value={executeData} />}
      </dl>
    </div>
  );
}
