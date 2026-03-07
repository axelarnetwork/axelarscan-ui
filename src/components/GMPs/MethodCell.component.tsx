import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Profile, AssetProfile } from '@/components/Profile';
import { isAxelar } from '@/lib/chain';
import { toArray } from '@/lib/parser';

import type { MethodCellProps, InterchainTransferData } from './GMPs.types';
import * as styles from './GMPs.styles';
import { getEvent } from './GMPs.utils';

export function MethodCell({ data: d }: MethodCellProps) {
  const symbol =
    d.call.returnValues?.symbol ||
    d.interchain_transfer?.symbol ||
    d.token_manager_deployment_started?.symbol ||
    d.interchain_token_deployment_started?.tokenSymbol ||
    d.link_token_started?.symbol ||
    d.token_metadata_registered?.symbol;

  return (
    <td className={styles.tdDefault}>
      <div className={styles.methodCellWrapper}>
        <Tag className={clsx(styles.methodTag)}>
          {getEvent(d)}
        </Tag>
        {symbol && (
          <AssetProfile
            value={symbol}
            chain={d.call.chain}
            amount={d.amount}
            ITSPossible={true}
            onlyITS={!getEvent(d)?.includes('ContractCall')}
            width={16}
            height={16}
            className={styles.assetProfileContainer}
            titleClassName={styles.assetProfileTitle}
          />
        )}
        {d.interchain_transfer?.contract_address &&
          !isAxelar(d.call.chain) && (
            <Tooltip
              content="Token Address"
              className={styles.tokenAddressTooltip}
              parentClassName={styles.tokenAddressTooltipParent}
            >
              <Profile
                address={d.interchain_transfer.contract_address}
                chain={d.call.chain}
                width={16}
                height={16}
                noResolveName={true}
                className={styles.tokenAddressProfile}
              />
            </Tooltip>
          )}
        {toArray(d.interchain_transfers).length > 0 && (
          <div className={styles.interchainTransfersWrapper}>
            {d.interchain_transfers!.map((_d: InterchainTransferData, i: number) => (
              <AssetProfile
                key={i}
                value={_d.contract_address || _d.symbol}
                chain={_d.destinationChain}
                amount={_d.amount}
                customAssetData={_d}
                ITSPossible={true}
                width={16}
                height={16}
                className={styles.assetProfileContainer}
                titleClassName={styles.assetProfileTitle}
              />
            ))}
          </div>
        )}
      </div>
    </td>
  );
}
