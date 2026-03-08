'use client';

import { useMemo, useState } from 'react';

import { Container } from '@/components/Container';
import { Metrics } from './Metrics.component';
import { CrossChainActivity } from './CrossChainActivity.component';
import { NetworkGraphSection } from './NetworkGraphSection.component';
import { buildChainPairs } from './Overview.utils';
import type { OverviewProps } from './Overview.types';
import * as styles from './Overview.styles';

export function Overview({
  data,
  chains,
  networkGraph,
  chainPairs: initialChainPairs,
}: OverviewProps) {
  const [chainFocus, setChainFocus] = useState<string | null>(null);

  const chainPairs = useMemo(
    () =>
      chainFocus
        ? buildChainPairs(data, chainFocus, chains)
        : initialChainPairs,
    [data, chainFocus, chains, initialChainPairs]
  );

  return (
    <>
      <Metrics />
      <Container className="mt-8">
        <div className={styles.contentWrapper}>
          <CrossChainActivity data={data} chains={chains} />
          <NetworkGraphSection
            data={data}
            networkGraph={networkGraph}
            chainPairs={chainPairs}
            setChainFocus={setChainFocus}
          />
        </div>
      </Container>
    </>
  );
}
