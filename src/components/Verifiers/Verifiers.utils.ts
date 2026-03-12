import _ from 'lodash';

import { fetchChains } from '@/lib/queries/chainQueries';
import { fetchVerifiers } from '@/lib/queries/validatorQueries';
import { getVerifiersVotes, getVerifiersSigns } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { toNumber } from '@/lib/number';
import type { Chain } from '@/types';

import type {
  VerifierVotesResponse,
  VerifierSignsResponse,
  VerifierData,
  RawVerifier,
  VerifiersPageData,
} from './Verifiers.types';

function getVoteCount(
  vote: boolean | string,
  chains: Record<string, { votes?: Record<string, number> }>
): number {
  return _.sum(
    Object.values({ ...chains }).map(v =>
      toNumber(
        _.last(
          Object.entries({ ...v?.votes }).find(([k]) =>
            equalsIgnoreCase(k, vote?.toString())
          )
        )
      )
    )
  );
}

function getSignCount(
  sign: boolean | string,
  chains: Record<string, { signs?: Record<string, number> }>
): number {
  return _.sum(
    Object.values({ ...chains }).map(v =>
      toNumber(
        _.last(
          Object.entries({ ...v?.signs }).find(([k]) =>
            equalsIgnoreCase(k, sign?.toString())
          )
        )
      )
    )
  );
}

export function mergeVerifierData(
  verifiers: RawVerifier[],
  verifiersVotes: VerifierVotesResponse,
  verifiersSigns: VerifierSignsResponse
): VerifierData[] {
  return verifiers.map(d => {
    const totalPolls = toNumber(verifiersVotes.total);
    const rawVotes = { ...verifiersVotes.data[d.address] };
    const totalVotes = toNumber(rawVotes.total);

    const totalProofs = toNumber(verifiersSigns.total);
    const rawSigns = { ...verifiersSigns.data[d.address] };
    const totalSigns = toNumber(rawSigns.total);

    const votesChains = rawVotes.chains ?? {};
    const signsChains = rawSigns.chains ?? {};

    return {
      ...d,
      total_polls: totalPolls,
      total_votes: totalVotes,
      total_yes_votes: getVoteCount(true, votesChains),
      total_no_votes: getVoteCount(false, votesChains),
      total_unsubmitted_votes: getVoteCount('unsubmitted', votesChains),
      total_proofs: totalProofs,
      total_signs: totalSigns,
      total_signed_signs: getSignCount(true, signsChains),
      total_unsubmitted_signs: getSignCount('unsubmitted', signsChains),
      votes: {
        ...rawVotes,
        chains: Object.fromEntries(
          Object.entries(votesChains).filter(([k]) =>
            d.supportedChains.some(sc => sc === k)
          )
        ),
      },
      signs: {
        ...rawSigns,
        chains: Object.fromEntries(
          Object.entries(signsChains).filter(([k]) =>
            d.supportedChains.some(sc => sc === k)
          )
        ),
      },
    } as VerifierData;
  });
}

export async function fetchVerifiersPageData(): Promise<VerifiersPageData | null> {
  const [chainsResult, verifiersResult, verifiersVotes, verifiersSigns] =
    await Promise.all([
      fetchChains(),
      fetchVerifiers(),
      getVerifiersVotes() as Promise<VerifierVotesResponse | null>,
      getVerifiersSigns() as Promise<VerifierSignsResponse | null>,
    ]);

  const chains = chainsResult;
  const verifiers = verifiersResult?.verifiers as RawVerifier[] | null;
  const verifiersByChain = verifiersResult?.verifiersByChain;

  if (!chains || !verifiers || !verifiersVotes?.data || !verifiersSigns?.data) {
    return null;
  }

  const data = mergeVerifierData(verifiers, verifiersVotes, verifiersSigns);

  const amplifierChains = (toArray(chains) as Chain[]).filter(
    c => c.chain_type === 'vm' && !c.deprecated
  );

  const additionalAmplifierChains = Object.entries({ ...verifiersByChain })
    .filter(
      ([k, v]) =>
        amplifierChains.findIndex(d => d.id === k) < 0 &&
        toArray((v as { addresses?: unknown[] })?.addresses).length > 0
    )
    .map(([k]) => k);

  return { verifiers: data, amplifierChains, additionalAmplifierChains };
}
