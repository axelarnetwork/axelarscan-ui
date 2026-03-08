import { Overview } from '@/components/Overview';
import { fetchOverviewData } from '@/lib/data/overview';

export const revalidate = 60;

export default async function Index() {
  const { data, chains, networkGraph, chainPairs } = await fetchOverviewData();
  return (
    <Overview
      data={data}
      chains={chains}
      networkGraph={networkGraph}
      chainPairs={chainPairs}
    />
  );
}
