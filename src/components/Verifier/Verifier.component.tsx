'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import {
  getRPCStatus,
  searchAmplifierPolls,
  searchAmplifierProofs,
  getVerifiersRewards,
  searchVerifiersRewards,
} from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import type {
  VerifierProps,
  VerifierData,
  VerifierPollEntry,
  VerifierSignEntry,
  RewardEntry,
  CumulativeRewardsData,
} from './Verifier.types';
import { Info } from './Info.component';
import { Votes } from './Votes.component';
import { Signs } from './Signs.component';
import * as styles from './Verifier.styles';

const SIZE = 200;

function flattenVerifierEntries(entries: unknown[], verifierAddress: string | undefined) {
  return toArray(entries).map((d: unknown) =>
    Object.fromEntries(
      Object.entries(d as Record<string, unknown>)
        .filter(([k]) => !k.startsWith('axelar') || equalsIgnoreCase(k, verifierAddress))
        .flatMap(([k, v]) =>
          equalsIgnoreCase(k, verifierAddress)
            ? Object.entries({ ...(v as Record<string, unknown>) }).map(([k, v]) => [k === 'id' ? 'txhash' : k, v])
            : [[k, v]]
        )
    )
  );
}

export function Verifier({ address }: VerifierProps) {
  const [data, setData] = useState<VerifierData | null>(null);
  const [votes, setVotes] = useState<VerifierPollEntry[] | null>(null);
  const [signs, setSigns] = useState<VerifierSignEntry[] | null>(null);
  const [rewards, setRewards] = useState<RewardEntry[] | null>(null);
  const [cumulativeRewards, setCumulativeRewards] = useState<CumulativeRewardsData | null>(null);
  const _chains = useChains();
  const verifiers = useVerifiers();

  useEffect(() => {
    if (!address || !verifiers) return;

    const found = verifiers.find((d: unknown) =>
      equalsIgnoreCase((d as Record<string, unknown>).address as string, address)
    );

    if (found) {
      if (!_.isEqual(found, data)) {
        setData(found as VerifierData);
      }
    } else if (!data) {
      setData({
        status: 'errorOnGetData',
        code: 404,
        message: `Verifier: ${address} not found`,
      });
    }
  }, [address, data, setData, verifiers]);

  useEffect(() => {
    if (!address || !data || data.status === 'error') return;

    const verifierAddress = data.address;

    const fetchMetrics = async () => {
      const { latest_block_height } = { ...(await getRPCStatus() as Record<string, unknown>) } as { latest_block_height?: number };
      if (!latest_block_height) return;

      const toBlock = latest_block_height - 1;
      const fromBlock = 1;

      await Promise.all([
        (async () => {
          try {
            if (!verifierAddress) return;
            const { data } = { ...(await searchAmplifierPolls({ voter: verifierAddress, fromBlock, toBlock, size: SIZE }) as Record<string, unknown>) };
            setVotes(flattenVerifierEntries(toArray(data), verifierAddress) as VerifierPollEntry[]);
          } catch {}
        })(),
        (async () => {
          try {
            if (!verifierAddress) return;
            const { data } = { ...(await searchAmplifierProofs({ signer: verifierAddress, fromBlock, toBlock, size: SIZE }) as Record<string, unknown>) };
            setSigns(flattenVerifierEntries(toArray(data), verifierAddress) as VerifierSignEntry[]);
          } catch {}
        })(),
        (async () => {
          try {
            if (!verifierAddress) return;
            const { data } = { ...(await searchVerifiersRewards({ verifierAddress, fromBlock: 1, size: SIZE }) as Record<string, unknown>) };
            setRewards(toArray(data));
          } catch {}
        })(),
        (async () => {
          try {
            if (!verifierAddress) return;
            const { data } = { ...(await getVerifiersRewards({ verifierAddress, fromBlock: 1 }) as Record<string, unknown>) };
            setCumulativeRewards((data as CumulativeRewardsData[] | undefined)?.[0] ?? null);
          } catch {}
        })(),
      ]);
    };

    fetchMetrics();
  }, [address, data]);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  if (data.status === 'errorOnGetData') {
    return (
      <Container className="sm:mt-8">
        <Response data={data} />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.mainGrid}>
        <div className={styles.mainLeft}>
          <Info data={data} address={address} rewards={rewards} cumulativeRewards={cumulativeRewards} />
        </div>
        {!(votes || signs) ? (
          <Spinner />
        ) : (
          <div className={styles.mainRight}>
            <Votes data={votes} />
            <Signs data={signs} />
          </div>
        )}
      </div>
    </Container>
  );
}
