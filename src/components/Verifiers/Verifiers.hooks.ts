'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useChains, useVerifiers, useVerifiersByChain } from '@/hooks/useGlobalData';
import { getVerifiersVotes, getVerifiersSigns } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';
import { toNumber } from '@/lib/number';
import type { Chain } from '@/types';

import type {
  VerifierVotesResponse,
  VerifierSignsResponse,
  VerifierData,
  RawVerifier,
} from './Verifiers.types';

interface UseVerifiersDataResult {
  data: VerifierData[] | null;
  amplifierChains: Chain[];
  additionalAmplifierChains: string[];
}

function getVoteCount(
  vote: boolean | string,
  chains: Record<string, { votes?: Record<string, number> }>
): number {
  return _.sum(
    Object.values({ ...chains }).map((v) =>
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
    Object.values({ ...chains }).map((v) =>
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

function mergeVerifierData(
  verifiers: RawVerifier[],
  verifiersVotes: VerifierVotesResponse,
  verifiersSigns: VerifierSignsResponse
): VerifierData[] {
  return verifiers.map((d) => {
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
            find(k, d.supportedChains)
          )
        ),
      },
      signs: {
        ...rawSigns,
        chains: Object.fromEntries(
          Object.entries(signsChains).filter(([k]) =>
            find(k, d.supportedChains)
          )
        ),
      },
    } as VerifierData;
  });
}

export function useVerifiersData(): UseVerifiersDataResult {
  const [verifiersVotes, setVerifiersVotes] = useState<VerifierVotesResponse | null>(null);
  const [verifiersSigns, setVerifiersSigns] = useState<VerifierSignsResponse | null>(null);
  const [data, setData] = useState<VerifierData[] | null>(null);

  const chains = useChains();
  const verifiers = useVerifiers();
  const verifiersByChain = useVerifiersByChain();

  useEffect(() => {
    const getData = async () => {
      const response = await getVerifiersVotes() as VerifierVotesResponse | null;
      if (response?.data) {
        setVerifiersVotes(response);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const response = await getVerifiersSigns() as VerifierSignsResponse | null;
      if (response?.data) {
        setVerifiersSigns(response);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (verifiersVotes && verifiersSigns && verifiers) {
      const _data = mergeVerifierData(
        verifiers as RawVerifier[],
        verifiersVotes,
        verifiersSigns
      );
      if (!_.isEqual(_data, data)) {
        setData(_data);
      }
    }
  }, [verifiersVotes, verifiersSigns, data, verifiers]);

  const amplifierChains = (toArray(chains) as Chain[]).filter(
    (c) => c.chain_type === 'vm' && !c.deprecated
  );

  const additionalAmplifierChains = Object.entries({ ...verifiersByChain })
    .filter(
      ([k, v]) =>
        amplifierChains.findIndex((d) => d.id === k) < 0 &&
        toArray(v as unknown[]).length > 0
    )
    .map(([k]) => k);

  return { data, amplifierChains, additionalAmplifierChains };
}
