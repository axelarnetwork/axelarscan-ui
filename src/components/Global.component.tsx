'use client';

import {
  useChains,
  useAssets,
  useITSAssets,
  useContracts,
  useConfigurations,
  useValidators,
  useVerifiers,
  useInflationData,
  useNetworkParameters,
} from '@/hooks/useGlobalData';

// Re-export hooks so existing imports from '@/components/Global' still work
// during gradual migration. Consumers should migrate to '@/hooks/useGlobalData'.
export {
  useChains,
  useAssets,
  useITSAssets,
  useContracts,
  useConfigurations,
  useValidators,
  useVerifiers,
  useInflationData,
  useNetworkParameters,
  useTVL,
  useStats,
} from '@/hooks/useGlobalData';

export { useVerifiersByChain } from '@/hooks/useGlobalData';

export function Global() {
  // Trigger the shared React Query subscriptions so data starts loading on mount.
  // Each hook registers a query with refetchInterval, replacing the old setInterval.
  // TVL and stats are large and only used by a few pages, so those pages load
  // them on mount instead.
  useChains();
  useAssets();
  useITSAssets();
  useContracts();
  useConfigurations();
  useValidators();
  useVerifiers();
  useInflationData();
  useNetworkParameters();

  return null;
}
