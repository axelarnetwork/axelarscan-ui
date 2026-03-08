'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MdLocalGasStation } from 'react-icons/md';

import { Number } from '@/components/Number';
import {
  useChains,
  useValidators,
  useInflationData,
  useNetworkParameters,
} from '@/hooks/useGlobalData';
import { getRPCStatus } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { isNumber } from '@/lib/number';
import { REFRESH_INTERVAL_MS } from './Overview.constants';
import { MetricWithTooltip } from './MetricWithTooltip.component';
import { StakedMetric } from './StakedMetric.component';
import { APRMetric } from './APRMetric.component';
import { InflationMetric } from './InflationMetric.component';
import * as styles from './Overview.styles';

export function Metrics() {
  const [blockData, setBlockData] = useState<{
    latest_block_height?: number;
    avg_block_time?: number;
  } | null>(null);
  const chains = useChains();
  const validators = useValidators();
  const inflationData = useInflationData();
  const networkParameters = useNetworkParameters();

  useEffect(() => {
    const getData = async () =>
      setBlockData(
        (await getRPCStatus({ avg_block_time: true })) as {
          latest_block_height?: number;
          avg_block_time?: number;
        } | null
      );

    getData();

    const interval = setInterval(() => getData(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [setBlockData]);

  if (!blockData) {
    return null;
  }

  const externalChainVotingInflationRate =
    inflationData?.externalChainVotingInflationRate;
  const evmRewardPercent = isNumber(externalChainVotingInflationRate)
    ? externalChainVotingInflationRate * 100
    : 0.2;

  const { symbol } = {
    ...(getChainData('axelarnet', chains)?.native_token as
      | { symbol?: string }
      | undefined),
  };

  const governanceHref =
    'https://axelar.network/blog/axelar-governance-explained';

  const hasBankAndStaking =
    !!networkParameters?.bankSupply?.amount &&
    !!networkParameters.stakingPool?.bonded_tokens;

  const hasInflation =
    !!inflationData &&
    inflationData.inflation != null &&
    inflationData.inflation > 0;

  return (
    <div className={styles.metricsWrapper}>
      <div className={styles.metricsInner}>
        {blockData.latest_block_height && (
          <div className={styles.metricRow}>
            <div className={styles.metricLabelWhitespace}>Latest Block:</div>
            <Link
              href={`/block/${blockData.latest_block_height}`}
              target="_blank"
              className={styles.metricLink}
            >
              <Number
                value={blockData.latest_block_height}
                className={styles.metricValue}
              />
            </Link>
            {blockData.avg_block_time && (
              <Number
                value={blockData.avg_block_time}
                prefix="("
                suffix="s)"
                className={styles.metricSecondary}
              />
            )}
          </div>
        )}
        <span className={styles.separator}>|</span>
        <div className={styles.metricItemsGroup}>
          {toArray(validators).length > 0 && (
            <div className={styles.metricRow}>
              <div className={styles.metricLabel}>Validators:</div>
              <Link
                href="/validators"
                target="_blank"
                className={styles.metricLink}
              >
                <Number
                  value={
                    validators!.filter(d => d.status === 'BOND_STATUS_BONDED')
                      .length
                  }
                  className={styles.metricValue}
                />
              </Link>
            </div>
          )}
          <div className={styles.metricRow}>
            <div className={styles.metricLabel}>Threshold:</div>
            <MetricWithTooltip
              tooltipContent="Threshold number of quadratic voting power required to onboard a new EVM chain"
              href={governanceHref}
            >
              <Number
                value={60}
                prefix=">"
                suffix="%"
                className={styles.metricValue}
              />
            </MetricWithTooltip>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricLabel}>Rewards:</div>
            <MetricWithTooltip
              tooltipContent="Base inflation rate + Additional chain rewards"
              href={governanceHref}
            >
              <Number
                value={evmRewardPercent}
                prefix="1% base + "
                suffix="% / EVM chain"
                className={styles.metricValue}
              />
            </MetricWithTooltip>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.gasLabelWrapper}>
              <MdLocalGasStation size={16} />
              <span>Unit:</span>
            </div>
            <MetricWithTooltip
              tooltipContent="AXL gas fees per transaction"
              href={governanceHref}
            >
              <Number
                value={0.007}
                suffix=" uaxl"
                className={styles.metricValue}
              />
            </MetricWithTooltip>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.gasLabelWrapper}>
              <MdLocalGasStation size={16} />
              <span className={styles.metricLabelWhitespace}>
                Per Transfer:
              </span>
            </div>
            <MetricWithTooltip
              tooltipContent="AXL gas fees per transaction"
              href={governanceHref}
            >
              <Number
                value={0.0014}
                suffix={` ${symbol}`}
                className={styles.metricValue}
              />
            </MetricWithTooltip>
          </div>
        </div>
        <span className={styles.separator}>|</span>
        {hasBankAndStaking && (
          <StakedMetric
            bankSupplyAmount={networkParameters!.bankSupply!.amount as string}
            bondedTokens={
              networkParameters!.stakingPool!.bonded_tokens as string
            }
          />
        )}
        {hasInflation && (
          <>
            {hasBankAndStaking && (
              <APRMetric
                inflation={inflationData!.inflation!}
                communityTax={inflationData!.communityTax!}
                bankSupplyAmount={
                  networkParameters!.bankSupply!.amount as string
                }
                bondedTokens={
                  networkParameters!.stakingPool!.bonded_tokens as string
                }
              />
            )}
            <InflationMetric inflation={inflationData!.inflation!} />
          </>
        )}
      </div>
    </div>
  );
}
