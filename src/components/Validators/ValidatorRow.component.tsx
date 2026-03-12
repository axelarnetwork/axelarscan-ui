import { memo } from 'react';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { ProgressBar } from '@/components/ProgressBar';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { isNumber } from '@/lib/number';
import { ellipse } from '@/lib/string';
import type { Chain, ValidatorsVotesChain } from '@/types';
import type { ValidatorRowProps } from './Validators.types';
import { EvmChainVote } from './EvmChainVote.component';
import * as styles from './Validators.styles';

export const ValidatorRow = memo(function ValidatorRow({
  validator: d,
  index: i,
  status,
  totalVotingPower,
  totalQuadraticVotingPower,
  cumulativeVotingPower,
  cumulativeQuadraticVotingPower,
  evmChains,
}: ValidatorRowProps) {
  const { rate } = { ...d.commission?.commission_rates };

  return (
    <tr className={styles.tr}>
      <td className={styles.tdIndex}>{i + 1}</td>
      <td className={styles.tdDefault}>
        <div className={styles.validatorInfoCol}>
          <Profile address={d.operator_address} prefix="axelarvaloper" />
          <Copy value={d.operator_address}>
            <span className={styles.operatorAddress}>
              {ellipse(d.operator_address, 6, 'axelarvaloper')}
            </span>
          </Copy>
          {isNumber(rate) && (
            <Number
              value={(rate as number) * 100}
              maxDecimals={2}
              prefix="Commission: "
              suffix="%"
              noTooltip={true}
              className={styles.numberMuted}
            />
          )}
          {isNumber(d.inflation) && (
            <Number
              value={(d.inflation as number) * 100}
              maxDecimals={2}
              prefix="Inflation: "
              suffix="%"
              noTooltip={true}
              className={styles.numberMuted}
            />
          )}
          {isNumber(d.apr) && (
            <Number
              value={d.apr}
              maxDecimals={2}
              prefix="APR: "
              suffix="%"
              noTooltip={true}
              className={styles.numberMuted}
            />
          )}
          {(status === 'inactive' || d.status !== 'BOND_STATUS_BONDED') && (
            <>
              {d.status && (
                <Tag
                  className={clsx(
                    styles.tagFit,
                    d.status.includes('UN')
                      ? d.status.endsWith('ED')
                        ? styles.tagUnbonded
                        : styles.tagUnbonding
                      : styles.tagBonded
                  )}
                >
                  {d.status.replace('BOND_STATUS_', '')}
                </Tag>
              )}
              {d.jailed && <Tag className={styles.tagJailed}>Jailed</Tag>}
            </>
          )}
        </div>
      </td>
      <td className={styles.tdDefault}>
        {isNumber(d.tokens) && (
          <div className={styles.votingPowerGrid}>
            <div className={styles.votingPowerRow}>
              <Number
                value={d.tokens}
                format="0,0.0a"
                noTooltip={true}
                className={styles.votingPowerValue}
              />
              {status === 'active' && (
                <Number
                  value={(d.tokens * 100) / totalVotingPower}
                  format="0,0.0a"
                  prefix="("
                  suffix="%)"
                  noTooltip={true}
                  className={styles.votingPowerPct}
                />
              )}
            </div>
            {status === 'active' && (
              <ProgressBar
                value={(cumulativeVotingPower * 100) / totalVotingPower}
              />
            )}
          </div>
        )}
      </td>
      {status === 'active' && (
        <td className={styles.tdDefault}>
          {isNumber(d.quadratic_voting_power) && (
            <div className={styles.votingPowerGrid}>
              <div className={styles.votingPowerRow}>
                <Number
                  value={d.quadratic_voting_power}
                  format="0,0.0a"
                  noTooltip={true}
                  className={styles.votingPowerValue}
                />
                <Number
                  value={
                    (d.quadratic_voting_power * 100) / totalQuadraticVotingPower
                  }
                  format="0,0.0a"
                  prefix="("
                  suffix="%)"
                  noTooltip={true}
                  className={styles.votingPowerPct}
                />
              </div>
              <ProgressBar
                value={
                  (cumulativeQuadraticVotingPower * 100) /
                  totalQuadraticVotingPower
                }
                className={styles.quadraticProgressBar}
              />
            </div>
          )}
        </td>
      )}
      <td className={styles.tdUptimeHidden}>
        <div className={styles.uptimeGrid}>
          {isNumber(d.uptime) && (
            <ProgressBar
              value={d.uptime}
              className={clsx(
                d.uptime < 50
                  ? styles.uptimeLow
                  : d.uptime < 80
                    ? styles.uptimeMed
                    : styles.uptimeHigh
              )}
            />
          )}
          {status === 'active' && isNumber(d.proposed_blocks) && (
            <div className={styles.proposedBlockCol}>
              <span className={styles.proposedBlockLabel}>Proposed Block</span>
              <div className={styles.proposedBlockRow}>
                <Number
                  value={d.proposed_blocks}
                  format="0,0.0a"
                  noTooltip={true}
                  className={styles.proposedBlockValue}
                />
                <Number
                  value={d.proposed_blocks_proportion}
                  format="0,0.0a"
                  prefix="("
                  suffix="%)"
                  noTooltip={true}
                  className={styles.proposedBlockPct}
                />
              </div>
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdEvmSupported}>
        <div className={styles.evmGrid}>
          {evmChains.map((c: Chain) => {
            const chainVotes = (
              (d.votes as Record<string, unknown>)?.chains as
                | Record<string, ValidatorsVotesChain>
                | undefined
            )?.[c.id];
            const isSupported = d.supportedChains?.includes(
              c.maintainer_id ?? ''
            );

            return (
              <EvmChainVote
                key={c.id}
                chain={c}
                votes={chainVotes}
                isSupported={!!isSupported}
              />
            );
          })}
        </div>
      </td>
    </tr>
  );
});
