'use client';

import { useQuery } from '@tanstack/react-query';

import { searchBlocks } from '@/lib/api/validator';

import { REFETCH_INTERVAL_MS } from './Blocks.constants';

import type { BlockEntry } from './Blocks.types';

const SIZE = 250;

interface BlocksResult {
  data: BlockEntry[];
}

async function fetchBlocks(): Promise<BlocksResult> {
  const response = (await searchBlocks({ size: SIZE })) as {
    data?: BlockEntry[];
  } | null;

  return { data: response?.data ?? [] };
}

export function useBlocksSearch(initialData: BlocksResult) {
  return useQuery({
    queryKey: ['blocks-search'],
    queryFn: fetchBlocks,
    initialData,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });
}
