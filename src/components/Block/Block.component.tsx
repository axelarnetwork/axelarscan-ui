'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Transactions } from '@/components/Transactions';
import { useValidators } from '@/hooks/useGlobalData';
import { getBlock, getValidatorSets } from '@/lib/api/validator';
import { toJson, toHex, toArray } from '@/lib/parser';
import { equalsIgnoreCase, removeDoubleQuote } from '@/lib/string';
import { isNumber, toNumber } from '@/lib/number';
import type { BlockData, ValidatorSetEntry, BlockProps } from './Block.types';
import { Info } from './Info.component';
import { BlockEvents } from './Events.component';
import * as styles from './Block.styles';

const BLOCK_EVENTS = ['begin_block_events', 'end_block_events'];

export function Block({ height }: BlockProps) {
  const [data, setData] = useState<BlockData | null>(null);
  const [validatorSets, setValidatorSets] = useState<ValidatorSetEntry[] | null>(null);
  const validators = useValidators();

  useEffect(() => {
    const getData = async () => {
      const responseData = await getBlock(height) as BlockData | undefined;

      if (!responseData) {
        return;
      }

      const nextBlock = await getBlock(toNumber(height) + 1) as BlockData | undefined;
      const { round, validators: blockValidators } = { ...nextBlock?.block?.last_commit };

      if (isNumber(round)) {
        responseData.round = round;
      }

      if (blockValidators) {
        responseData.validators = blockValidators;
      }

      for (const f of BLOCK_EVENTS) {
        const events = responseData[f as keyof BlockData];
        if (events) {
          (responseData as Record<string, unknown>)[f] = Object.entries(
            _.groupBy(events as Record<string, unknown>[], 'type')
          ).map(([k, v]) => ({
            type: k,
            data: (v as Record<string, unknown>[]).map(e =>
              Object.fromEntries(
                (toArray(e.attributes as unknown[]) as Record<string, unknown>[]).map(a => [
                  a.key,
                  removeDoubleQuote(toJson(a.value) || toHex(a.value)),
                ])
              )
            ),
          }));
        }
      }

      console.log('[data]', responseData);
      setData(responseData);
    };

    getData();
  }, [height]);

  useEffect(() => {
    const getData = async () => {
      if (!height || !data || !validators) {
        return;
      }

      const validatorSetsResponse = await getValidatorSets(height) as { result?: { validators?: Record<string, unknown>[] } } | undefined;
      setValidatorSets(
        (toArray(validatorSetsResponse?.result?.validators) as Record<string, unknown>[]).map(d => ({
          ...d,
          ...validators.find(v =>
            equalsIgnoreCase(v.consensus_address, d.address as string | undefined)
          ),
        })) as ValidatorSetEntry[]
      );
    };

    getData();
  }, [height, data, validators]);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.mainGrid}>
        <Info data={data} height={height} validatorSets={validatorSets} />
        <div className={styles.transactionsCol}>
          <Transactions height={height} />
        </div>
        <div className={styles.eventsCol}>
          <BlockEvents data={data} />
        </div>
      </div>
    </Container>
  );
}
