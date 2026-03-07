import _ from 'lodash';

import {
  searchUptimes,
  searchProposedBlocks,
  searchEVMPolls,
  getValidatorDelegations,
} from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import type { Delegation, UptimeBlock, ProposedBlock, EVMVote } from '@/types';

const SIZE = 200;
const NUM_LATEST_BLOCKS = 10000;
const NUM_LATEST_PROPOSED_BLOCKS = 2500;

export async function fetchDelegations(
  address: string
): Promise<Delegation[] | null> {
  const result = (await getValidatorDelegations({ address })) as Record<
    string,
    unknown
  >;
  return (result?.data as Delegation[] | null) ?? null;
}

export async function fetchUptimes(
  latestBlockHeight: number,
  consensusAddress: string | undefined
): Promise<UptimeBlock[]> {
  const toBlock = latestBlockHeight - 1;
  const fromBlock = toBlock - SIZE;

  const { data: uptimeData } = {
    ...((await searchUptimes({ fromBlock, toBlock, size: SIZE })) as Record<
      string,
      unknown
    >),
  };

  return _.range(0, SIZE).map(i => {
    const height = toBlock - i;
    const ud = toArray(uptimeData).find(
      (item: Record<string, unknown>) => item.height === height
    ) as Record<string, unknown> | undefined;

    return {
      ...ud,
      height,
      status:
        toArray(ud?.validators as string[]).findIndex((a: string) =>
          equalsIgnoreCase(a, consensusAddress as string)
        ) > -1,
    };
  });
}

export async function fetchProposedBlocks(
  latestBlockHeight: number,
  consensusAddress: string | undefined
): Promise<ProposedBlock[]> {
  const toBlock = latestBlockHeight - 1;
  const fromBlock = toBlock - NUM_LATEST_PROPOSED_BLOCKS;

  const { data: proposedData } = {
    ...((await searchProposedBlocks({
      fromBlock,
      toBlock,
      size: NUM_LATEST_PROPOSED_BLOCKS,
    })) as Record<string, unknown>),
  };

  return toArray(proposedData).filter((d: Record<string, unknown>) =>
    equalsIgnoreCase(d.proposer as string, consensusAddress as string)
  ) as ProposedBlock[];
}

export async function fetchVotes(
  latestBlockHeight: number,
  broadcasterAddress: string | undefined
): Promise<EVMVote[]> {
  if (!broadcasterAddress) return [];

  const toBlock = latestBlockHeight - 1;
  const fromBlock = toBlock - NUM_LATEST_BLOCKS;

  const { data: votesData } = {
    ...((await searchEVMPolls({
      voter: broadcasterAddress,
      fromBlock,
      toBlock,
      size: SIZE,
    })) as Record<string, unknown>),
  };

  return toArray(votesData).map((d: unknown) =>
    Object.fromEntries(
      Object.entries(d as Record<string, unknown>)
        .filter(
          ([k, _v]) =>
            !k.startsWith('axelar1') || equalsIgnoreCase(k, broadcasterAddress)
        )
        .flatMap(([k, v]) =>
          equalsIgnoreCase(k, broadcasterAddress)
            ? Object.entries({ ...(v as Record<string, unknown>) }).map(
                ([k2, v2]) => [k2 === 'id' ? 'txhash' : k2, v2]
              )
            : [[k, v]]
        )
    )
  ) as EVMVote[];
}
