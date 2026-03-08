'use client';

import { useQuery } from '@tanstack/react-query';

import { THIRTY_SECONDS_MS } from '@/lib/constants';

import { fetchVerifiersPageData } from './Verifiers.utils';
import type { VerifiersPageData } from './Verifiers.types';

export function useVerifiersData(initialData: VerifiersPageData | null) {
  return useQuery({
    queryKey: ['verifiers-page'],
    queryFn: fetchVerifiersPageData,
    initialData: initialData ?? undefined,
    refetchInterval: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
  });
}
