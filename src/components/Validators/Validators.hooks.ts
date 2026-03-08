'use client';

import { useQuery } from '@tanstack/react-query';

import { THIRTY_SECONDS_MS } from '@/lib/constants';

import { fetchValidatorsPageData } from './Validators.utils';
import type { ValidatorsPageData } from './Validators.types';

export function useValidatorsData(initialData: ValidatorsPageData | null) {
  return useQuery({
    queryKey: ['validators-page'],
    queryFn: fetchValidatorsPageData,
    initialData: initialData ?? undefined,
    refetchInterval: THIRTY_SECONDS_MS,
    refetchOnWindowFocus: false,
  });
}
