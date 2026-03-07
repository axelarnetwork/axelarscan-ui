import type { RewardsContractInfo, ContractsTableProps } from './AmplifierRewards.types';
import * as styles from './AmplifierRewards.styles';
import { ContractFieldCell } from './ContractFieldCell.component';

const CONTRACT_FIELDS = [
  { id: 'balance', title: 'Reward pool balance' },
  { id: 'epoch_duration', title: 'Epoch duration (blocks)' },
  { id: 'rewards_per_epoch', title: 'Rewards per epoch' },
  { id: 'last_distribution_epoch', title: 'Last distribution epoch' },
  { id: 'address', title: 'Contract addresses' },
];

export function ContractsTable({
  contracts,
  symbol,
  chainName,
  multisigProverAddress,
}: ContractsTableProps) {
  return (
    <div className={styles.contractsCard}>
      <table className={styles.contractsTable}>
        <thead className={styles.contractsThead}>
          <tr className={styles.contractsTheadRow}>
            <th scope="col" className={styles.contractsTh}></th>
            {contracts.map(({ id, title }) => (
              <th key={id} scope="col" className={styles.contractsTh}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.contractsTbody}>
          {CONTRACT_FIELDS.map(f => (
            <tr key={f.id} className={styles.contractsTr}>
              <td className={styles.contractsTdLabel}>
                <div className={styles.contractsTdLabelText}>{f.title}</div>
              </td>
              {contracts.map((d: RewardsContractInfo) => (
                <td key={`${d.id}_${f.id}`} className={styles.contractsTd}>
                  <div className={styles.contractsTdContent}>
                    <ContractFieldCell
                      field={f.id}
                      contract={d}
                      symbol={symbol}
                      chainName={chainName}
                      multisigProverAddress={multisigProverAddress}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
