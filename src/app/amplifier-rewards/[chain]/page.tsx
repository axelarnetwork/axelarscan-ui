import { AmplifierRewards } from '@/components/AmplifierRewards';
import type {
  RewardsDistribution,
  RewardsPoolData,
} from '@/components/AmplifierRewards/AmplifierRewards.types';
import { PAGE_SIZE } from '@/components/AmplifierRewards/AmplifierRewards.types';
import { searchRewardsDistribution, getRewardsPool } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { fetchChains } from '@/lib/queries/chainQueries';
import { equalsIgnoreCase } from '@/lib/string';

export const revalidate = 30;

export default async function AmplifierRewardsPage({
  params,
}: {
  params: Promise<{ chain: string }>;
}) {
  const { chain } = await params;

  const [chains, searchResponse, poolResponse, aggsResponse] =
    await Promise.all([
      fetchChains(),
      searchRewardsDistribution({ chain, size: PAGE_SIZE }) as Promise<Record<
        string,
        unknown
      > | null>,
      getRewardsPool({ chain }) as Promise<Record<string, unknown> | null>,
      searchRewardsDistribution({
        chain,
        aggs: { cumulativeRewards: { sum: { field: 'total_amount' } } },
        size: 0,
      }) as Promise<Record<string, unknown> | null>,
    ]);

  const chainData = getChainData(chain, chains);
  const votingVerifierAddress = (
    chainData?.voting_verifier as { address?: string } | undefined
  )?.address;

  const rawData = searchResponse?.data as
    | Record<string, unknown>[]
    | undefined;
  const total = searchResponse?.total as number | undefined;

  const distributions = toArray(rawData).map(
    (d: Record<string, unknown>) => ({
      ...d,
      pool_type: equalsIgnoreCase(
        (d.contract_address || d.multisig_contract_address) as
          | string
          | undefined,
        votingVerifierAddress
      )
        ? 'verification'
        : 'signing',
    })
  ) as RewardsDistribution[];

  const rewardsPool =
    (
      (poolResponse?.data as RewardsPoolData[] | undefined)?.[0] as
        | RewardsPoolData
        | undefined
    ) ?? null;

  const aggs = aggsResponse?.aggs as
    | { cumulativeRewards?: { value?: number } }
    | undefined;
  const cumulativeRewards = isNumber(aggs?.cumulativeRewards?.value)
    ? aggs!.cumulativeRewards!.value!
    : null;

  return (
    <AmplifierRewards
      chain={chain}
      initialSearchResults={{
        data: distributions,
        total: total || distributions.length,
      }}
      initialRewardsPool={rewardsPool}
      initialCumulativeRewards={cumulativeRewards}
    />
  );
}
