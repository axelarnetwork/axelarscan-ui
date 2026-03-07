import _ from 'lodash';

import { split, toArray } from '@/lib/parser';
import { includesSomePatterns, toTitle } from '@/lib/string';

import type { EVMPollData, PollVote, VoteOption } from './EVMPoll.types';

/** Map a vote's boolean to a string label. */
export function voteToOption(vote: boolean | undefined): string {
  if (vote === true) return 'yes';
  if (vote === false) return 'no';
  return 'unsubmitted';
}

/** Map a vote option string to a sort-order index. */
export function voteOptionSortIndex(option: string): number {
  if (option === 'yes') return 0;
  if (option === 'no') return 1;
  return 2;
}

/** Derive the status string from poll flags. */
export function resolveStatus(
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
export function resolveEventName(d: EVMPollData): string {
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
export function buildPollUrl(
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
    !(
      includesSomePatterns(eventName, ['transfer', 'Transfer']) ||
      d.deposit_address
    );
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
export function buildVoteOptions(
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

/** Resolve vote boolean to a human-readable label. */
export function resolveVoteLabel(vote: boolean | undefined): string {
  if (vote === true) return 'yes';
  if (vote === false) return 'no';
  return 'unsubmitted';
}
