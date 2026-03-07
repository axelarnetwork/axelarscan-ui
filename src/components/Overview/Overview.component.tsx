'use client';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Metrics } from './Metrics.component';
import { CrossChainActivity } from './CrossChainActivity.component';
import { NetworkGraphSection } from './NetworkGraphSection.component';
import { useOverviewData, useChainPairs } from './Overview.hooks';
import * as styles from './Overview.styles';

export function Overview() {
  const { data, networkGraph, chainFocus, setChainFocus, chains } =
    useOverviewData();
  const chainPairs = useChainPairs(data, chainFocus, chains);

  return (
    <>
      <Metrics />
      <Container className="mt-8">
        {!data ? (
          <Spinner />
        ) : (
          <div className={styles.contentWrapper}>
            <CrossChainActivity data={data} chains={chains} />
            <NetworkGraphSection
              data={data}
              networkGraph={networkGraph}
              chainPairs={chainPairs}
              setChainFocus={setChainFocus}
            />
          </div>
        )}
      </Container>
    </>
  );
}
