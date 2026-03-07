import { Number } from '@/components/Number';
import { getAssetData, getChainData } from '@/lib/config';
import { split } from '@/lib/parser';

import type { CommandParamsProps } from './EVMBatch.types';
import { AssetBadge } from './AssetBadge.component';
import { SourceChainInfo } from './SourceChainInfo.component';
import { MintTransferInfo } from './MintTransferInfo.component';
import { SaltInfo } from './SaltInfo.component';
import { NameInfo } from './NameInfo.component';
import { OperatorsInfo } from './OperatorsInfo.component';
import * as styles from './EVMBatch.styles';

export function CommandParams({
  command,
  chain,
  chains,
  assets,
}: CommandParamsProps) {
  const { type, deposit_address } = { ...command };
  const {
    amount,
    name,
    cap,
    account,
    salt,
    newOwners,
    newOperators,
    newWeights,
    newThreshold,
    sourceChain,
    sourceTxHash,
    contractAddress,
  } = { ...command.params };
  let { symbol, decimals } = { ...command.params };

  const transferID = parseInt(command.id, 16);
  const assetData = getAssetData(symbol, assets);

  symbol = assetData?.addresses?.[chain]?.symbol || assetData?.symbol || symbol;
  decimals =
    assetData?.addresses?.[chain]?.decimals ||
    assetData?.decimals ||
    decimals ||
    18;
  const image = assetData?.addresses?.[chain]?.image || assetData?.image;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(chain, chains);

  return (
    <div className={styles.paramsWrapper}>
      {symbol && !['approveContractCall'].includes(type!) && (
        <AssetBadge
          image={image}
          amount={amount}
          assets={assets}
          decimals={decimals}
          symbol={symbol}
        />
      )}
      {sourceChainData && (
        <SourceChainInfo
          sourceChainData={sourceChainData}
          sourceTxHash={sourceTxHash}
          commandId={command.id}
          contractAddress={contractAddress}
          destinationChainData={destinationChainData}
          chain={chain}
        />
      )}
      {type === 'mintToken' && (
        <MintTransferInfo
          transferID={transferID}
          account={account}
          chain={chain}
        />
      )}
      {salt && <SaltInfo salt={salt} depositAddress={deposit_address} />}
      {name && <NameInfo name={name} decimals={decimals} cap={cap} />}
      {newOwners && (
        <Number
          value={split(newOwners, { delimiter: ';' }).length}
          suffix={' New Owners'}
          className={styles.ownersBadge}
        />
      )}
      {newOperators && (
        <OperatorsInfo newOperators={newOperators} newWeights={newWeights} />
      )}
      {newThreshold && (
        <Number
          value={newThreshold}
          prefix={'Threshold: '}
          className={styles.thresholdText}
        />
      )}
    </div>
  );
}
