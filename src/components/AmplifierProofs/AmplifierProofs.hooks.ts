'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';

import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';

import type {
  BlockData,
  SearchResult,
  AmplifierProofsSearchResult,
} from './AmplifierProofs.types';
import { REFETCH_INTERVAL_MS } from './AmplifierProofs.constants';
import { buildProofEntry } from './AmplifierProofs.utils';

const SIZE = 25;

async function fetchProofsData(
  params: Record<string, unknown>,
  blockData: BlockData | null
): Promise<SearchResult> {
  const [response, latestBlockData] = await Promise.all([
    searchAmplifierProofs({ ...params, size: SIZE }) as Promise<
      Record<string, unknown> | undefined
    >,
    blockData
      ? Promise.resolve(blockData)
      : (getRPCStatus() as Promise<BlockData>),
  ]);

  const effectiveBlockData = latestBlockData ?? { latest_block_height: 0 };
  const { data, total } = {
    ...(response as { data?: unknown[]; total?: number }),
  };

  return {
    data: _.orderBy(
      toArray(data).map(d => buildProofEntry(d, effectiveBlockData)),
      ['created_at.ms'],
      ['desc']
    ),
    total: total ?? 0,
  };
}

export function useAmplifierProofsSearch(
  initialData: AmplifierProofsSearchResult | null
) {
  const searchParams = useSearchParams();
  const params = getParams(searchParams, SIZE);

  return useQuery({
    queryKey: ['amplifier-proofs-search', params],
    queryFn: () => fetchProofsData(params, initialData?.blockData ?? null),
    initialData: initialData
      ? { data: initialData.data, total: initialData.total }
      : undefined,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
