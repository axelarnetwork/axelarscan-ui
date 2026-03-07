'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MdLocalGasStation } from 'react-icons/md';

import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { useChains, useValidators, useInflationData, useNetworkParameters } from '@/hooks/useGlobalData';
import { getRPCStatus } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { isNumber, formatUnits } from '@/lib/number';
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setBlockData(await getRPCStatus({ avg_block_time: true }) as any);

    getData();

    const interval = setInterval(() => getData(), 6 * 1000);
    return () => clearInterval(interval);
  }, [setBlockData]);

  if (!blockData) {
    return null;
  }

  const externalChainVotingInflationRate = inflationData?.externalChainVotingInflationRate;
  const evmRewardPercent = isNumber(externalChainVotingInflationRate)
    ? externalChainVotingInflationRate * 100
    : 0.2;

  const { symbol } = {
    ...(getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined),
  };

  return (
    <div className={styles.metricsWrapper}>
      <div className={styles.metricsInner}>
        {blockData.latest_block_height && (
          <div className={styles.metricRow}>
            <div className={styles.metricLabelWhitespace}>
              Latest Block:
            </div>
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
              <div className={styles.metricLabel}>
                Validators:
              </div>
              <Link
                href="/validators"
                target="_blank"
                className={styles.metricLink}
              >
                <Number
                  value={
                    validators!.filter((d) => d.status === 'BOND_STATUS_BONDED')
                      .length
                  }
                  className={styles.metricValue}
                />
              </Link>
            </div>
          )}
          <div className={styles.metricRow}>
            <div className={styles.metricLabel}>
              Threshold:
            </div>
            <Link
              href="https://axelar.network/blog/axelar-governance-explained"
              target="_blank"
              className={styles.metricLink}
            >
              <div className={styles.tooltipDesktopOnly}>
                <Tooltip
                  content="Threshold number of quadratic voting power required to onboard a new EVM chain"
                  className={styles.tooltipWhitespace}
                >
                  <Number
                    value={60}
                    prefix=">"
                    suffix="%"
                    className={styles.metricValue}
                  />
                </Tooltip>
              </div>
              <div className={styles.mobileOnly}>
                <div className={styles.mobileInner}>
                  <Number
                    value={60}
                    prefix=">"
                    suffix="%"
                    className={styles.metricValue}
                  />
                </div>
              </div>
            </Link>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.metricLabel}>
              Rewards:
            </div>
            <Link
              href="https://axelar.network/blog/axelar-governance-explained"
              target="_blank"
              className={styles.metricLink}
            >
              <div className={styles.tooltipDesktopOnly}>
                <Tooltip
                  content="Base inflation rate + Additional chain rewards"
                  className={styles.tooltipWhitespace}
                >
                  <Number
                    value={evmRewardPercent}
                    prefix="1% base + "
                    suffix="% / EVM chain"
                    className={styles.metricValue}
                  />
                </Tooltip>
              </div>
              <div className={styles.mobileOnly}>
                <div className={styles.mobileInner}>
                  <Number
                    value={evmRewardPercent}
                    prefix="1% base + "
                    suffix="% / EVM chain"
                    className={styles.metricValue}
                  />
                </div>
              </div>
            </Link>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.gasLabelWrapper}>
              <MdLocalGasStation size={16} />
              <span>Unit:</span>
            </div>
            <Link
              href="https://axelar.network/blog/axelar-governance-explained"
              target="_blank"
              className={styles.metricLink}
            >
              <div className={styles.tooltipDesktopOnly}>
                <Tooltip
                  content="AXL gas fees per transaction"
                  className={styles.tooltipWhitespace}
                >
                  <Number
                    value={0.007}
                    suffix=" uaxl"
                    className={styles.metricValue}
                  />
                </Tooltip>
              </div>
              <div className={styles.mobileOnly}>
                <div className={styles.mobileInner}>
                  <Number
                    value={0.007}
                    suffix=" uaxl"
                    className={styles.metricValue}
                  />
                </div>
              </div>
            </Link>
          </div>
          <div className={styles.metricRow}>
            <div className={styles.gasLabelWrapper}>
              <MdLocalGasStation size={16} />
              <span className={styles.metricLabelWhitespace}>Per Transfer:</span>
            </div>
            <Link
              href="https://axelar.network/blog/axelar-governance-explained"
              target="_blank"
              className={styles.metricLink}
            >
              <div className={styles.tooltipDesktopOnly}>
                <Tooltip
                  content="AXL gas fees per transaction"
                  className={styles.tooltipWhitespace}
                >
                  <Number
                    value={0.0014}
                    suffix={` ${symbol}`}
                    className={styles.metricValue}
                  />
                </Tooltip>
              </div>
              <div className={styles.mobileOnly}>
                <div className={styles.mobileInner}>
                  <Number
                    value={0.0014}
                    suffix={` ${symbol}`}
                    className={styles.metricValue}
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>
        <span className={styles.separator}>|</span>
        {networkParameters?.bankSupply?.amount &&
          networkParameters.stakingPool?.bonded_tokens && (
            <div className={styles.metricRow}>
              <div className={styles.metricLabel}>
                Staked:
              </div>
              <Link
                href="/validators"
                target="_blank"
                className={styles.metricLink}
              >
                <Number
                  value={formatUnits(
                    networkParameters.stakingPool.bonded_tokens,
                    6
                  )}
                  format="0,0a"
                  noTooltip={true}
                  className={styles.metricValue}
                />
                <Number
                  value={formatUnits(networkParameters.bankSupply.amount, 6)}
                  format="0,0.00a"
                  prefix="/ "
                  noTooltip={true}
                  className={styles.stakedValueExtra}
                />
              </Link>
            </div>
          )}
        {inflationData && inflationData.inflation != null && inflationData.inflation > 0 && (
          <>
            {networkParameters?.bankSupply?.amount &&
              networkParameters.stakingPool?.bonded_tokens && (
                <div className={styles.metricRow}>
                  <div className={styles.metricLabel}>
                    APR:
                  </div>
                  <Link
                    href="https://wallet.keplr.app/chains/axelar"
                    target="_blank"
                    className={styles.metricLink}
                  >
                    <Number
                      value={
                        (inflationData!.inflation! *
                          100 *
                          (formatUnits(
                            networkParameters.bankSupply!.amount,
                            6
                          ) as number) *
                          (1 - inflationData!.communityTax!) *
                          (1 - 0.05)) /
                        (formatUnits(
                          networkParameters.stakingPool!.bonded_tokens,
                          6
                        ) as number)
                      }
                      suffix="%"
                      noTooltip={true}
                      className={styles.metricValue}
                    />
                  </Link>
                </div>
              )}
            <div className={styles.metricRow}>
              <div className={styles.metricLabel}>
                Inflation:
              </div>
              <Link
                href="/validators"
                target="_blank"
                className={styles.metricLink}
              >
                <Number
                  value={inflationData.inflation * 100}
                  suffix="%"
                  noTooltip={true}
                  className={styles.metricValue}
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
