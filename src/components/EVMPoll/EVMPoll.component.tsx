'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { useChains, useValidators } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { getValuesOfAxelarAddressKey } from '@/lib/parser';
import { isNumber, toNumber } from '@/lib/number';

import type { EVMPollProps, EVMPollData, PollVote } from './EVMPoll.types';
import { Info } from './Info.component';
import { Votes } from './Votes.component';
import * as styles from './EVMPoll.styles';
import { voteToOption, resolveStatus, resolveEventName, buildPollUrl, buildVoteOptions } from './EVMPoll.utils';

export function EVMPoll({ id }: EVMPollProps) {
  const [data, setData] = useState<EVMPollData | null>(null);
  const chains = useChains();
  const validators = useValidators();

  useEffect(() => {
    const getData = async () => {
      const response = await searchEVMPolls({ pollId: id }) as { data?: EVMPollData[] } | undefined;

      let d = response?.data?.[0];
      if (!d) {
        setData({} as EVMPollData);
        return;
      }

      const votes = (getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as PollVote[]).map(v => ({
        ...v,
        option: voteToOption(v.vote),
      }));

      if (d.confirmation_events && !d.transaction_id) {
        d.transaction_id = d.confirmation_events[0]?.txID;
      }

      const eventName = resolveEventName(d);
      const { url: explorerUrl, transaction_path } = {
        ...getChainData(d.sender_chain, chains)?.explorer,
      };
      const txhashConfirm = votes.find(v => v.confirmed)?.id;

      d = {
        ...d,
        idNumber: isNumber(d.id) ? toNumber(d.id) : d.id,
        status: resolveStatus(d, txhashConfirm),
        height: _.minBy(votes, 'height')?.height || d.height,
        confirmation_txhash: txhashConfirm,
        votes: _.orderBy(votes, ['height', 'created_at'], ['desc', 'desc']),
        voteOptions: buildVoteOptions(votes, d.participants),
        eventName,
        url: buildPollUrl(d, eventName, explorerUrl, transaction_path),
      };

      console.log('[data]', d);
      setData({ ...d } as EVMPollData);
    };

    getData();
  }, [id, setData, chains]);

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
        {validators && <Votes data={data} />}
      </div>
    </Container>
  );
}
