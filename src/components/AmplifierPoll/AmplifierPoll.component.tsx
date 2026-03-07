'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import { headString, lastString } from '@/lib/string';
import type {
  AmplifierPollProps,
  AmplifierPollData,
  RPCStatusData,
  PollVote,
  VoteOption,
} from './AmplifierPoll.types';
import {
  getVoteLabel,
  getVoteOptionIndex,
  derivePollStatus,
} from './AmplifierPoll.types';
import { Info } from './Info.component';
import { Votes } from './Votes.component';
import * as styles from './AmplifierPoll.styles';

export function AmplifierPoll({ id }: AmplifierPollProps) {
  const [data, setData] = useState<AmplifierPollData | null>(null);
  const [blockData, setBlockData] = useState<RPCStatusData | null>(null);
  const chains = useChains();
  const verifiers = useVerifiers();

  useEffect(() => {
    const getData = async () =>
      setBlockData((await getRPCStatus()) as RPCStatusData);
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (!blockData) return;

      const response = (await searchAmplifierPolls({
        verifierContractAddress: id.includes('_')
          ? headString(id, '_')
          : undefined,
        pollId: lastString(id, '_'),
      })) as { data?: AmplifierPollData[] } | undefined;

      let d = response?.data?.[0];

      if (d) {
        const pollVotes = (
          getValuesOfAxelarAddressKey(
            d as unknown as Record<string, unknown>
          ) as PollVote[]
        ).map(v => ({
          ...v,
          option: getVoteLabel(v.vote),
        }));

        const voteOptions: VoteOption[] = Object.entries(
          _.groupBy(pollVotes, 'option')
        )
          .map(([k, v]) => ({
            option: k,
            value: v?.length,
            voters: toArray(v?.map(item => item.voter)) as string[],
          }))
          .filter(v => v.value)
          .map(v => ({
            ...v,
            i: getVoteOptionIndex(v.option),
          }));

        if (
          toArray(d.participants).length > 0 &&
          voteOptions.findIndex(v => v.option === 'unsubmitted') < 0 &&
          _.sumBy(voteOptions, 'value') < (d.participants?.length ?? 0)
        ) {
          voteOptions.push({
            option: 'unsubmitted',
            value:
              (d.participants?.length ?? 0) - _.sumBy(voteOptions, 'value'),
          });
        }

        d = {
          ...d,
          status: derivePollStatus(d, blockData.latest_block_height ?? 0),
          height: _.minBy(pollVotes, 'height')?.height || d.height,
          votes: _.orderBy(
            pollVotes,
            ['height', 'created_at'],
            ['desc', 'desc']
          ),
          voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
          url: `/gmp/${d.transaction_id || 'search'}`,
        };
      }

      setData({ ...d } as AmplifierPollData);
    };

    getData();
  }, [id, blockData, chains]);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.mainLayout}>
        <Info data={data} id={id} />
        {verifiers && <Votes data={data} />}
      </div>
    </Container>
  );
}
