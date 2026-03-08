'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { THIRTY_SECONDS_MS } from '@/lib/constants';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams } from '@/lib/operator';

import { processPollData } from './AmplifierPolls.utils';
import type {
  AmplifierPollEntry,
  AmplifierPollsSearchResult,
} from './AmplifierPolls.types';

const SIZE = 25;

async function fetchAmplifierPollsData(
  params: Record<string, unknown>
): Promise<AmplifierPollsSearchResult> {
  const [response, rpcStatus] = await Promise.all([
    searchAmplifierPolls({ ...params, size: SIZE }) as Promise<{
      data?: AmplifierPollEntry[];
      total?: number;
    } | null>,
    getRPCStatus() as Promise<{ latest_block_height?: number } | null>,
  ]);

  const { data, total } = { ...response };
  const latestBlockHeight = rpcStatus?.latest_block_height ?? 0;

  return {
    data: processPollData(
      toArray(data) as AmplifierPollEntry[],
      latestBlockHeight
    ),
    total: total ?? 0,
  };
}

export function useAmplifierPollsSearch(
  initialData: AmplifierPollsSearchResult | null
) {
  const searchParams = useSearchParams();
  const params = getParams(searchParams, SIZE);

  return useQuery({
    queryKey: ['amplifier-polls-search', params],
    queryFn: () => fetchAmplifierPollsData(params),
    initialData: initialData ?? undefined,
    refetchInterval: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
  });
}
