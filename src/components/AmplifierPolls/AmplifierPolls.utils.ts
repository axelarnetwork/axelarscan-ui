import _ from 'lodash';

import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import type { AmplifierPollEntry, PollVote, PollVoteOption } from './AmplifierPolls.types';

export function deriveStatus(
  d: AmplifierPollEntry,
  latestBlockHeight: number,
): string {
  if (d.success) return 'completed';
  if (d.failed) return 'failed';
  if (d.expired || (d.expired_height ?? 0) < latestBlockHeight) return 'expired';
  return 'pending';
}

export function getVoteOptionSortIndex(option: string): number {
  if (option === 'yes') return 0;
  if (option === 'no') return 1;
  return 2;
}

export function buildVoteOptions(
  votes: PollVote[],
  participants: string[] | undefined,
): PollVoteOption[] {
  const voteOptions: PollVoteOption[] = Object.entries(_.groupBy(votes, 'option'))
    .map(([k, v]) => ({
      option: k,
      value: v?.length,
      voters: (v?.map((item) => item.voter)).filter(Boolean) as string[],
    }))
    .filter((v) => v.value)
    .map((v) => ({
      ...v,
      i: getVoteOptionSortIndex(v.option),
    }));

  const participantCount = participants?.length ?? 0;
  const hasParticipants = toArray(participants).length > 0;
  const hasUnsubmitted = voteOptions.findIndex((v) => v.option === 'unsubmitted') >= 0;
  const totalVotes = _.sumBy(voteOptions, 'value');

  if (hasParticipants && !hasUnsubmitted && totalVotes < participantCount) {
    voteOptions.push({
      option: 'unsubmitted',
      value: participantCount - totalVotes,
    });
  }

  return _.orderBy(voteOptions, ['i'], ['asc']);
}

export function processPollData(
  data: AmplifierPollEntry[],
  latestBlockHeight: number,
): AmplifierPollEntry[] {
  return _.orderBy(
    data.map((d) => {
      const votes = (
        getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as PollVote[]
      ).map((v) => ({
        ...v,
        option: v.vote ? 'yes' : typeof v.vote === 'boolean' ? 'no' : 'unsubmitted',
      }));

      return {
        ...d,
        status: deriveStatus(d, latestBlockHeight),
        height: _.minBy(votes, 'height')?.height || d.height,
        votes: _.orderBy(votes, ['height', 'created_at'], ['desc', 'desc']),
        voteOptions: buildVoteOptions(votes, d.participants),
        url: `/gmp/${d.transaction_id || 'search'}`,
      } as AmplifierPollEntry;
    }),
    ['created_at.ms'],
    ['desc'],
  );
}

