import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { isNumber, formatUnits } from '@/lib/number';

import type { RewardsContractInfo } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';

interface ContractFieldCellProps {
  field: string;
  contract: RewardsContractInfo;
  symbol: string | undefined;
  chainName: string | undefined;
  multisigProverAddress: string | undefined;
}

export function ContractFieldCell({
  field,
  contract,
  symbol,
  chainName,
  multisigProverAddress,
}: ContractFieldCellProps) {
  switch (field) {
    case 'balance':
      return (
        <Number
          value={formatUnits(String(contract.balance ?? '0'), 6)}
          suffix={` ${symbol}`}
          noTooltip={true}
          className="font-medium"
        />
      );

    case 'epoch_duration':
      if (!isNumber(contract.epoch_duration)) return <>-</>;
      return (
        <Number
          value={contract.epoch_duration}
          format="0,0"
          className="font-medium"
        />
      );

    case 'rewards_per_epoch':
      return (
        <Number
          value={formatUnits(String(contract.rewards_per_epoch ?? '0'), 6)}
          suffix={` ${symbol}`}
          noTooltip={true}
          className="font-medium"
        />
      );

    case 'last_distribution_epoch':
      if (
        !isNumber(contract.epoch_duration) ||
        !contract.last_distribution_epoch
      ) {
        return <>-</>;
      }
      return (
        <Number
          value={contract.last_distribution_epoch}
          format="0,0"
          className="font-medium"
        />
      );

    case 'address':
      return (
        <div className={styles.addressFlexCol}>
          {contract.id === 'multisig' && multisigProverAddress && (
            <div className={styles.addressRow}>
              <Profile address={multisigProverAddress} />
              <span>{chainName} Prover</span>
            </div>
          )}
          <div className={styles.addressRow}>
            <Profile address={contract.address} />
            {contract.id === 'voting_verifier' ? (
              <span>{chainName} Voting Verifier</span>
            ) : (
              <Tooltip
                content="The global Multisig contract is used for the rewards pool for signing"
                className={styles.tooltipContent}
              >
                <span>Global Multisig</span>
              </Tooltip>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
