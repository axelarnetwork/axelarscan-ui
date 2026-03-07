'use client';

import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { find } from '@/lib/string';

import type { InfoProps, RewardsContractInfo } from './AmplifierRewards.types';
import { InfoSummary } from './InfoSummary.component';
import { ContractsTable } from './ContractsTable.component';

export function Info({ chain, rewardsPool, cumulativeRewards }: InfoProps) {
  const chains = useChains();
  const verifiers = useVerifiers();

  const chainData = getChainData(chain, chains);
  const id = chainData?.id;
  const name = chainData?.name;
  const multisigProver = chainData?.multisig_prover as { address?: string } | undefined;
  const { voting_verifier, multisig } = { ...rewardsPool };

  const contracts: RewardsContractInfo[] = [
    { ...voting_verifier, id: 'voting_verifier', title: 'Verification' },
    { ...multisig, id: 'multisig', title: 'Signing' },
  ];

  const symbol = (getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined)?.symbol;

  const verifierCount = toArray(verifiers).filter(
    (d: Record<string, unknown>) => id && find(id, d.supportedChains as string[])
  ).length;

  return (
    <>
      <InfoSummary
        chain={chain}
        chainId={id}
        verifierCount={verifierCount}
        cumulativeRewards={cumulativeRewards}
        totalBalance={rewardsPool?.balance}
        symbol={symbol}
      />
      <ContractsTable
        contracts={contracts}
        symbol={symbol}
        chainName={name}
        multisigProverAddress={multisigProver?.address}
      />
    </>
  );
}
