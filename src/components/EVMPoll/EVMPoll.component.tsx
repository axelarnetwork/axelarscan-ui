'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { useChains, useValidators } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { split, toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import { includesSomePatterns, toTitle } from '@/lib/string';
import { isNumber, toNumber } from '@/lib/number';

import type { EVMPollProps, EVMPollData, PollVote, VoteOption } from './EVMPoll.types';
import { Info } from './Info.component';
import { Votes } from './Votes.component';
import * as styles from './EVMPoll.styles';

/** Map a vote's boolean to a string label. */
function voteToOption(vote: boolean | undefined): string {
  if (vote === true) return 'yes';
  if (vote === false) return 'no';
  return 'unsubmitted';
}

/** Map a vote option string to a sort-order index. */
function voteOptionSortIndex(option: string): number {
  if (option === 'yes') return 0;
  if (option === 'no') return 1;
  return 2;
}

/** Derive the status string from poll flags. */
function resolveStatus(
  d: EVMPollData,
  txhashConfirm: string | undefined
): string {
  if (d.success) return 'completed';
  if (d.failed) return 'failed';
  if (d.expired) return 'expired';
  if (d.confirmation || txhashConfirm) return 'confirmed';
  return 'pending';
}

/** Derive the event name from raw event and confirmation_events. */
function resolveEventName(d: EVMPollData): string {
  let eventName = split(d.event, {
    delimiter: '_',
    toCase: 'lower',
  }).join('_');

  if (d.confirmation_events) {
    const { type } = { ...d.confirmation_events[0] };

    switch (type) {
      case 'depositConfirmation':
        if (!eventName) eventName = 'Transfer';
        break;
      case 'ContractCallApproved':
        if (!eventName) eventName = 'ContractCall';
        break;
      case 'ContractCallApprovedWithMint':
      case 'ContractCallWithMintApproved':
        if (!eventName) eventName = 'ContractCallWithToken';
        break;
      default:
        eventName = type ?? '';
        break;
    }
  }

  return d.event ? toTitle(eventName, '_', true, true) : eventName;
}

/** Build the URL for the poll based on event type and IDs. */
function buildPollUrl(
  d: EVMPollData,
  eventName: string,
  explorerUrl: string | undefined,
  transactionPath: string | undefined
): string {
  if (includesSomePatterns(eventName, ['operator', 'token_deployed'])) {
    return `${explorerUrl}${transactionPath?.replace('{tx}', d.transaction_id!)}`;
  }

  const isGmp =
    includesSomePatterns(eventName, ['contract_call', 'ContractCall']) ||
    !(includesSomePatterns(eventName, ['transfer', 'Transfer']) || d.deposit_address);
  const routePrefix = isGmp ? 'gmp' : 'transfer';

  if (d.transaction_id) {
    return `/${routePrefix}/${d.transaction_id}`;
  }
  if (d.transfer_id) {
    return `/${routePrefix}/?transferId=${d.transfer_id}`;
  }
  return `/${routePrefix}/`;
}

/** Build the full vote options array from raw votes. */
function buildVoteOptions(
  votes: PollVote[],
  participants: string[] | undefined
): VoteOption[] {
  const voteOptions: VoteOption[] = Object.entries(_.groupBy(votes, 'option'))
    .map(([k, v]) => ({
      option: k,
      value: v?.length,
      voters: v?.map(item => item.voter).filter(Boolean) as string[],
    }))
    .filter(v => v.value)
    .map(v => ({
      ...v,
      i: voteOptionSortIndex(v.option),
    }));

  const participantsList = toArray(participants) as string[];
  const hasUnsubmitted = voteOptions.some(v => v.option === 'unsubmitted');
  const totalVoted = _.sumBy(voteOptions, 'value');

  if (
    participantsList.length > 0 &&
    !hasUnsubmitted &&
    totalVoted < participantsList.length
  ) {
    voteOptions.push({
      option: 'unsubmitted',
      value: participantsList.length - totalVoted,
      voters: [],
      i: 2,
    });
  }

  return _.orderBy(voteOptions, ['i'], ['asc']);
}

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
