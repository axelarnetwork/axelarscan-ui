'use client';

import _ from 'lodash';
import { usePathname } from 'next/navigation';

import { useGlobalStore } from '@/components/Global';
import { Number } from '@/components/Number';
import { toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { summaryStyles } from './Summary.styles';
import { SummaryProps } from './Summary.types';
import { processContracts, processTVLData } from './Summary.utils';

export function Summary({ data, params }: SummaryProps) {
  const pathname = usePathname();
  const globalStore = useGlobalStore();

  if (!data) {
    return null;
  }

  const {
    GMPStatsByChains,
    GMPTotalVolume,
    transfersStats,
    transfersTotalVolume,
  } = { ...data };

  const contracts = processContracts(data);

  const chains = params?.contractAddress
    ? _.uniq(contracts.flatMap(d => d.chains))
    : toArray(globalStore.chains).filter(
        d => !d.deprecated && (!d.maintainer_id || d.gateway?.address)
      );

  const tvlData = processTVLData(
    toArray(globalStore.tvl?.data),
    globalStore.assets,
    globalStore.itsAssets
  );

  return (
    <div className={summaryStyles.container}>
      <dl className={summaryStyles.grid}>
        <div className={summaryStyles.stat.container(true)}>
          <dt className={summaryStyles.stat.label}>Transactions</dt>
          <dd className={summaryStyles.stat.value.container}>
            <Number
              value={
                toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
                toNumber(transfersStats?.total)
              }
              format="0,0"
              noTooltip={true}
              className={summaryStyles.stat.value.number}
            />
          </dd>
          <dd className={summaryStyles.stat.breakdown.container}>
            <Number
              value={toNumber(
                _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
              )}
              format="0,0.00a"
              prefix="GMP: "
              noTooltip={true}
              className={summaryStyles.stat.breakdown.item}
            />
            <Number
              value={toNumber(transfersStats?.total)}
              format="0,0.00a"
              prefix="Transfer: "
              noTooltip={true}
              className={summaryStyles.stat.breakdown.item}
            />
          </dd>
        </div>
        <div className={summaryStyles.stat.container(false)}>
          <dt className={summaryStyles.stat.label}>Volume</dt>
          <dd className={summaryStyles.stat.value.container}>
            <Number
              value={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
              format="0,0"
              prefix="$"
              noTooltip={true}
              className={summaryStyles.stat.value.number}
            />
          </dd>
          <dd className={summaryStyles.stat.breakdown.container}>
            <Number
              value={toNumber(GMPTotalVolume)}
              format="0,0.00a"
              prefix="GMP: $"
              noTooltip={true}
              className={summaryStyles.stat.breakdown.item}
            />
            <Number
              value={toNumber(transfersTotalVolume)}
              format="0,0.00a"
              prefix="Transfer: $"
              noTooltip={true}
              className={summaryStyles.stat.breakdown.item}
            />
          </dd>
        </div>
        {tvlData.length > 0 && pathname === '/' ? (
          <div className={summaryStyles.stat.container(false)}>
            <dt className={summaryStyles.stat.label}>Total Value Locked</dt>
            <dd className={summaryStyles.stat.value.container}>
              <Number
                value={_.sumBy(
                  tvlData.filter(d => (d.value || 0) > 0),
                  'value'
                )}
                format="0,0.00a"
                prefix="$"
                noTooltip={true}
                className={summaryStyles.stat.value.number}
              />
            </dd>
            <dd className={summaryStyles.stat.breakdown.container}>
              <Number
                value={_.sumBy(
                  tvlData.filter(
                    d => (d.value || 0) > 0 && d.assetType !== 'its'
                  ),
                  'value'
                )}
                format="0,0.00a"
                prefix="Gateway: $"
                noTooltip={true}
                className={summaryStyles.stat.breakdown.item}
              />
              <Number
                value={_.sumBy(
                  tvlData.filter(
                    d => (d.value || 0) > 0 && d.assetType === 'its'
                  ),
                  'value'
                )}
                format="0,0.00a"
                prefix="ITS: $"
                noTooltip={true}
                className={summaryStyles.stat.breakdown.item}
              />
            </dd>
          </div>
        ) : (
          <div className={summaryStyles.stat.container(false)}>
            <dt className={summaryStyles.stat.label}>
              Average Volume / Transaction
            </dt>
            <dd className={summaryStyles.stat.value.container}>
              <Number
                value={
                  (toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)) /
                  (toNumber(
                    _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
                  ) + toNumber(transfersStats?.total) || 1)
                }
                format="0,0"
                prefix="$"
                noTooltip={true}
                className={summaryStyles.stat.value.number}
              />
            </dd>
            <dd className={summaryStyles.stat.breakdown.container}>
              <Number
                value={
                  toNumber(GMPTotalVolume) /
                  (toNumber(
                    _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
                  ) || 1)
                }
                format="0,0.00a"
                prefix="GMP: $"
                noTooltip={true}
                className={summaryStyles.stat.breakdown.item}
              />
              <Number
                value={
                  toNumber(transfersTotalVolume) /
                  (toNumber(transfersStats?.total) || 1)
                }
                format="0,0.00a"
                prefix="Transfer: $"
                noTooltip={true}
                className={summaryStyles.stat.breakdown.item}
              />
            </dd>
          </div>
        )}
        <div className={summaryStyles.stat.container(false)}>
          <dt className={summaryStyles.stat.label}>GMP Contracts</dt>
          <dd className={summaryStyles.stat.value.container}>
            <Number
              value={contracts.length}
              format="0,0"
              noTooltip={true}
              className={summaryStyles.stat.value.number}
            />
          </dd>
          <dd className={summaryStyles.stat.breakdown.container}>
            <Number
              value={
                chains.filter(
                  d => !d.deprecated && (!d.maintainer_id || !d.no_inflation)
                ).length
              }
              format="0,0"
              prefix="Number of chains: "
              className={summaryStyles.stat.breakdown.item}
            />
          </dd>
        </div>
      </dl>
    </div>
  );
}
