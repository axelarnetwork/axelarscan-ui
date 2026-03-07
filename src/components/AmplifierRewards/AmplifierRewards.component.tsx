'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import type { Chain } from '@/types';
import { useChains } from '@/hooks/useGlobalData';
import { searchRewardsDistribution, getRewardsPool } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { equalsIgnoreCase, toBoolean } from '@/lib/string';
import { isNumber } from '@/lib/number';

import type {
  RewardsDistribution,
  RewardsPoolData,
  SearchResults,
  AmplifierRewardsProps,
} from './AmplifierRewards.types';
import { PAGE_SIZE } from './AmplifierRewards.types';
import { Info } from './Info.component';
import { Filters } from './Filters.component';
import { DistributionRow } from './DistributionRow.component';
import * as styles from './AmplifierRewards.styles';

export function AmplifierRewards({ chain }: AmplifierRewardsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [distributionExpanded, setDistributionExpanded] = useState<string | null>(null);
  const [rewardsPool, setRewardsPool] = useState<RewardsPoolData | null>(null);
  const [cumulativeRewards, setCumulativeRewards] = useState<number | null>(null);
  const chains = useChains();

  useEffect(() => {
    if (!chain && chains) {
      const path = `${pathname}/${chains.filter((d: Chain) => d.chain_type === 'vm')[0]?.chain_name}`;

      if (path !== pathname) {
        router.push(path);
      }
    }
  }, [chain, router, pathname, chains]);

  useEffect(() => {
    const _params = getParams(searchParams, PAGE_SIZE);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!chain || !params || !toBoolean(refresh) || !chains) return;

      const chainDataForSearch = getChainData(chain, chains);
      const voting_verifier = chainDataForSearch?.voting_verifier;
      const searchResponse = await searchRewardsDistribution({ ...params, chain, size: PAGE_SIZE }) as
        Record<string, unknown> | null;
      const data = searchResponse?.data as Record<string, unknown>[] | undefined;
      const total = searchResponse?.total as number | undefined;

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: toArray(data).map((d: Record<string, unknown>) => ({
            ...d,
            pool_type: equalsIgnoreCase(
              (d.contract_address || d.multisig_contract_address) as string | undefined,
              voting_verifier?.address
            )
              ? 'verification'
              : 'signing',
          })) as RewardsDistribution[],
          total: total || toArray(data).length,
        },
      });
      setRefresh(false);

      setDistributionExpanded(null);
      const poolResponse = await getRewardsPool({ chain }) as
        Record<string, unknown> | null;
      setRewardsPool(
        ((poolResponse?.data as RewardsPoolData[] | undefined)?.[0]) ?? null
      );

      const aggsResponse = await searchRewardsDistribution({
        ...params,
        chain,
        aggs: { cumulativeRewards: { sum: { field: 'total_amount' } } },
        size: 0,
      }) as Record<string, unknown> | null;
      const aggs = aggsResponse?.aggs as
        { cumulativeRewards?: { value?: number } } | undefined;

      if (isNumber(aggs?.cumulativeRewards?.value)) {
        setCumulativeRewards(aggs.cumulativeRewards.value);
      }
    };

    getData();
  }, [
    chain,
    params,
    setSearchResults,
    refresh,
    setRefresh,
    setDistributionExpanded,
    setRewardsPool,
    chains,
  ]);

  const resultKey = params ? generateKeyByParams(params) : '';
  const { data, total } = { ...searchResults?.[resultKey] };
  const symbol = (getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined)?.symbol;

  if (!data) {
    return (
      <Container className={styles.containerClass}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.containerClass}>
      <div className={styles.mainWrapper}>
        <div className={styles.sectionWrapper}>
          <div className={styles.headerRow}>
            <div className={styles.headerAuto}>
              <h1 className={styles.pageTitle}>
                Amplifier Rewards
              </h1>
            </div>
          </div>
          <Info
            chain={chain ?? ''}
            rewardsPool={rewardsPool}
            cumulativeRewards={cumulativeRewards}
          />
        </div>
        <div>
          <div className={styles.headerRow}>
            <div className={styles.headerAuto}>
              <h2 className={styles.sectionTitle}>
                Rewards distribution history
              </h2>
              <p className={styles.resultText}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.actionsRow}>
              <Filters />
              {refresh ? (
                <Spinner />
              ) : (
                <Button
                  color="default"
                  circle="true"
                  onClick={() => setRefresh(true)}
                >
                  <MdOutlineRefresh size={20} />
                </Button>
              )}
            </div>
          </div>
          {refresh && <Overlay />}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadRow}>
                  <th scope="col" className={styles.thFirst}>Height</th>
                  <th scope="col" className={styles.thTxHash}>Tx Hash</th>
                  <th scope="col" className={styles.thMiddle}>Pool</th>
                  <th scope="col" className={styles.thMiddle}>Recipients</th>
                  <th scope="col" className={styles.thPayoutRight}>Payout</th>
                  <th scope="col" className={styles.thLast}>Payout at</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d: RewardsDistribution) => (
                  <DistributionRow
                    key={d.txhash}
                    distribution={d}
                    distributionExpanded={distributionExpanded}
                    setDistributionExpanded={setDistributionExpanded}
                    symbol={symbol}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {(total ?? 0) > PAGE_SIZE && (
            <div className={styles.paginationWrapper}>
              <Pagination sizePerPage={PAGE_SIZE} total={total ?? 0} />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
