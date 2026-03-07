import type { Chain } from '@/types';
import { getChains } from '@/lib/api/axelarscan';
import { ENVIRONMENT } from '@/lib/config';

export const fetchChains = async (): Promise<Chain[] | null> => {
  const chains = await getChains() as Chain[] | null;
  if (!chains) return null;

  return chains.filter(
    (d: Chain) =>
      d.chain_type !== 'vm' ||
      d.voting_verifier?.address ||
      ['devnet-amplifier'].includes(ENVIRONMENT ?? '')
  );
};
