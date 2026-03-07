'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { useValidators } from '@/hooks/useGlobalData';
import { getProposal } from '@/lib/api/axelarscan';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { toNumber } from '@/lib/number';

import { Info } from './Info.component';
import { Votes } from './Votes.component';
import type { ProposalData, VoteEntry } from './Proposal.types';
import * as styles from './Proposal.styles';

export function Proposal({ id }: { id: string }) {
  const [data, setData] = useState<ProposalData | null>(null);
  const validators = useValidators();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setValidatorsToVotes = (votes: any) => {
      if (!validators) {
        return votes as VoteEntry[];
      }

      return _.orderBy(
        toArray(votes)
          .map((d: VoteEntry) => ({
            ...d,
            validatorData: validators.find((v) =>
              equalsIgnoreCase(v.delegator_address, d.voter)
            ),
          }))
          .map((d) => ({
            ...d,
            voting_power: d.validatorData ? d.validatorData.tokens : -1,
          })),
        ['voting_power', 'validatorData.description.moniker'],
        ['desc', 'asc']
      );
    };

    const getData = async () => {
      if (validators) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await getProposal({ id }) as any;
        setData({ ...response, votes: setValidatorsToVotes(response?.votes) });
      }
    };

    getData();
  }, [id, validators]);

  const { proposal_id, voting_end_time, votes } = { ...data };

  const end = voting_end_time && voting_end_time < moment().valueOf();
  const voteOptions = Object.entries(_.groupBy(toArray(votes), 'option'))
    .map(([k, v]) => ({
      option: k,
      value: toArray(v).length,
    }))
    .filter((d) => d.value);

  const isLoading = !(data && (!proposal_id || toNumber(id) === toNumber(proposal_id)));

  if (isLoading) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.mainLayout}>
        <Info id={id} data={data} end={!!end} voteOptions={voteOptions} />
        {!end && validators && <Votes data={votes!} />}
      </div>
    </Container>
  );
}
