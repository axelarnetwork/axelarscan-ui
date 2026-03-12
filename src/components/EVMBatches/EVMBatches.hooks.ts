'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { searchBatches } from '@/lib/api/token-transfer';
import { ENVIRONMENT } from '@/lib/config';
import { getParams } from '@/lib/operator';

import { REFETCH_INTERVAL_MS } from './EVMBatches.constants';
import type { BatchSearchResponse } from './EVMBatches.types';
import { PAGE_SIZE } from './EVMBatches.types';

async function fetchBatchData(
  params: Record<string, unknown>
): Promise<BatchSearchResponse> {
  let response = (await searchBatches({
    ...params,
    size: PAGE_SIZE,
  })) as BatchSearchResponse | null;

  if (
    response &&
    !response.data &&
    !['mainnet', 'testnet'].includes(ENVIRONMENT!)
  ) {
    response = { data: [], total: 0 };
  }

  return response ?? { data: [], total: 0 };
}

export function useEVMBatchesSearch(initialData: BatchSearchResponse | null) {
  const searchParams = useSearchParams();
  const params = getParams(searchParams, PAGE_SIZE);

  return useQuery({
    queryKey: ['evm-batches-search', params],
    queryFn: () => fetchBatchData(params),
    initialData: initialData ?? undefined,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
