'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TablePagination } from '@/components/Pagination';
import { useChains, useVerifiersByChain } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { isNumber } from '@/lib/number';

import { RewardRow } from './RewardRow.component';
import type { InfoProps, RewardEntry, VerifierChainEntry } from './Verifier.types';
import * as styles from './Verifier.styles';

const REWARDS_SIZE_PER_PAGE = 10;

export function Info({ data, address, rewards, cumulativeRewards }: InfoProps) {
  const [rewardsPage, setRewardsPage] = useState(1);
  const chains = useChains();
  const verifiersByChain = useVerifiersByChain();

  const { supportedChains } = { ...data };
  const { bonding_state, authorization_state, weight } = {
    ...Object.values({ ...verifiersByChain })
      .flatMap((d: unknown) => toArray((d as Record<string, unknown>)?.addresses))
      .find((d: unknown) => equalsIgnoreCase((d as Record<string, unknown>).address as string, address)),
  } as VerifierChainEntry;
  const { symbol } = { ...(getChainData('axelarnet', chains)?.native_token as Record<string, unknown>) } as { symbol?: string };

  const pageStart = (rewardsPage - 1) * REWARDS_SIZE_PER_PAGE;
  const visibleRewards = rewards?.filter((_d, i) => i >= pageStart && i < pageStart + REWARDS_SIZE_PER_PAGE);

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Profile address={address} width={32} height={32} />
        </h3>
      </div>
      <div className={styles.infoPanelBorder}>
        <dl className={styles.infoPanelDefinitionList}>
          {supportedChains && (
            <>
              <div className={styles.dlRow}>
                <dt className={styles.dlLabel}>Status</dt>
                <dd className={styles.dlValueWithSpace}>
                  <Tag className={clsx(styles.statusTagFit, supportedChains.length > 0 ? styles.statusTagActive : styles.statusTagInactive)}>
                    {supportedChains.length > 0 ? 'Active' : 'Inactive'}
                  </Tag>
                  {isNumber(bonding_state?.Bonded?.amount) && (
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>Bonding State:</span>
                      <Number value={bonding_state.Bonded.amount} suffix={` ${symbol}`} noTooltip={true} />
                    </div>
                  )}
                  {authorization_state && (
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>Authorization State:</span>
                      <span>{authorization_state}</span>
                    </div>
                  )}
                  {isNumber(weight) && (
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>Weight:</span>
                      <Number value={weight} noTooltip={true} />
                    </div>
                  )}
                </dd>
              </div>
              <div className={styles.dlRow}>
                <dt className={styles.dlLabel}>Amplifier Supported</dt>
                <dd className={styles.dlValue}>
                  <div className={styles.supportedChainsGrid}>
                    {supportedChains.map((c: string, i: number) => {
                      const { name, image } = { ...getChainData(c, chains) };
                      return (
                        <Tooltip key={i} content={name} className={styles.chainTooltip}>
                          <Image src={image} alt="" width={20} height={20} className={styles.chainImage} />
                        </Tooltip>
                      );
                    })}
                  </div>
                </dd>
              </div>
            </>
          )}
          {cumulativeRewards && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>Cumulative Rewards</dt>
              <dd className={styles.dlValue}>
                <Tooltip
                  content={
                    <div className={styles.cumulativeRewardsTooltipContent}>
                      {(toArray(cumulativeRewards.chains) as RewardEntry[]).map((d, i) => (
                        <Number
                          key={i}
                          value={d.amount}
                          format="0,0.000000"
                          prefix={`${getChainData(d.chain, chains)?.name || d.chain}: `}
                          noTooltip={true}
                          className={styles.cumulativeRewardsNumber}
                        />
                      ))}
                    </div>
                  }
                  className={styles.chainTooltip}
                  parentClassName={styles.cumulativeRewardsTooltipParent}
                >
                  <Number value={cumulativeRewards.total_rewards} suffix={` ${symbol}`} noTooltip={true} className={styles.cumulativeRewardsNumber} />
                </Tooltip>
              </dd>
            </div>
          )}
          {rewards && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>Latest Rewards Distribution</dt>
              <dd className={styles.dlValue}>
                <div className={styles.rewardsWrapper}>
                  <div className={styles.rewardsTableScroll}>
                    <table className={styles.rewardsTable}>
                      <thead className={styles.rewardsTableHead}>
                        <tr className={styles.rewardsTableHeadRow}>
                          <th scope="col" className={styles.rewardsThFirst}>Height</th>
                          <th scope="col" className={styles.rewardsThMiddle}>Chain</th>
                          <th scope="col" className={styles.rewardsThRight}>Payout</th>
                          <th scope="col" className={styles.rewardsThLast}>Payout at</th>
                        </tr>
                      </thead>
                      <tbody className={styles.rewardsTableBody}>
                        {visibleRewards?.map((d, i) => <RewardRow key={i} entry={d} />)}
                      </tbody>
                    </table>
                  </div>
                  {rewards.length > REWARDS_SIZE_PER_PAGE && (
                    <TablePagination data={rewards} value={rewardsPage} onChange={(page: number) => setRewardsPage(page)} sizePerPage={REWARDS_SIZE_PER_PAGE} />
                  )}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
