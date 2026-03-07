'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import { headString, lastString } from '@/lib/string';

import type { AmplifierProofProps, AmplifierProofData, RPCStatusData, ProofSign } from './AmplifierProof.types';
import { Info } from './Info.component';
import { Signs } from './Signs.component';
import * as styles from './AmplifierProof.styles';

export function AmplifierProof({ id }: AmplifierProofProps) {
  const [data, setData] = useState<AmplifierProofData | null>(null);
  const [blockData, setBlockData] = useState<RPCStatusData | null>(null);
  const _chains = useChains();
  const verifiers = useVerifiers();

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as RPCStatusData);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (!blockData) return;

      const response = await searchAmplifierProofs({
          multisigContractAddress: id.includes('_')
            ? headString(id, '_')
            : undefined,
          sessionId: lastString(id, '_'),
        }) as { data?: AmplifierProofData[] } | undefined;

      let d = response?.data?.[0];

      if (d) {
        const signs = (getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as ProofSign[]).map(s => ({
          ...s,
          option: s.sign ? 'signed' : 'unsubmitted',
        }));

        const signOptions = Object.entries(_.groupBy(signs, 'option'))
          .map(([k, v]) => ({
            option: k,
            value: v?.length,
            signers: v?.map(item => item.signer).filter(Boolean) as string[],
          }))
          .filter(s => s.value)
          .map(s => ({
            ...s,
            i: s.option === 'signed' ? 0 : 1,
          }));

        // add unsubmitted option
        if (
          toArray(d.participants).length > 0 &&
          signOptions.findIndex(s => s.option === 'unsubmitted') < 0 &&
          _.sumBy(signOptions, 'value') < d.participants!.length
        ) {
          signOptions.push({
            option: 'unsubmitted',
            value: d.participants!.length - _.sumBy(signOptions, 'value'),
            i: 1,
            signers: [],
          });
        }

        d = {
          ...d,
          status: d.success
            ? 'completed'
            : d.failed
              ? 'failed'
              : d.expired || (d.expired_height != null && blockData.latest_block_height != null && d.expired_height < blockData.latest_block_height)
                ? 'expired'
                : 'pending',
          height: _.minBy(signs, 'height')?.height || d.height,
          signs: _.orderBy(signs, ['height', 'created_at'], ['desc', 'desc']),
          signOptions: _.orderBy(signOptions, ['i'], ['asc']),
        };
      }

      console.log('[data]', d);
      setData({ ...d });
    };

    getData();
  }, [id, setData, blockData]);

  if (!data) {
    return (
      <Container className={styles.containerClass}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.containerClass}>
      <div className={styles.contentWrapper}>
        <Info data={data} id={id} />
        {verifiers && <Signs data={data} />}
      </div>
    </Container>
  );
}
