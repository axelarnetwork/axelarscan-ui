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
  useTVL,
  useStats,
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
  // Trigger all React Query subscriptions so data starts loading on mount.
  // Each hook registers a query with refetchInterval, replacing the old setInterval.
  useChains();
  useAssets();
  useITSAssets();
  useContracts();
  useConfigurations();
  useValidators();
  useVerifiers();
  useInflationData();
  useNetworkParameters();
  useTVL();
  useStats();

  return null;
}
