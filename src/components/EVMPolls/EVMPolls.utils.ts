import _ from 'lodash';

import { getChainData } from '@/lib/config';
import { split, toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import { includesSomePatterns, toTitle } from '@/lib/string';
import { isNumber, toNumber } from '@/lib/number';
import type { Chain } from '@/types';

import type { PollVote, VoteOption, EVMPollRecord, ProcessedPoll } from './EVMPolls.types';

/** Map vote option string to a sort index: yes=0, no=1, unsubmitted=2 */
export function voteOptionSortIndex(option: string): number {
  if (option === 'yes') return 0;
  if (option === 'no') return 1;
  return 2;
}

/** Derive poll status from boolean flags and confirmation data */
export function derivePollStatus(
  d: EVMPollRecord,
  txhashConfirm: string | undefined
): string {
  if (d.success) return 'completed';
  if (d.failed) return 'failed';
  if (d.expired) return 'expired';
  if (d.confirmation || txhashConfirm) return 'confirmed';
  return 'pending';
}

/** Build the URL path for a given poll based on its event name and IDs */
export function buildPollUrl(
  eventName: string,
  d: EVMPollRecord,
  explorerUrl: string | undefined,
  transactionPath: string | undefined
): string {
  const isOperatorOrTokenDeployed = includesSomePatterns(eventName, [
    'operator',
    'token_deployed',
  ]);

  if (isOperatorOrTokenDeployed) {
    return `${explorerUrl}${transactionPath?.replace('{tx}', d.transaction_id || '')}`;
  }

  const isContractCall =
    includesSomePatterns(eventName, ['contract_call', 'ContractCall']);
  const isTransfer =
    includesSomePatterns(eventName, ['transfer', 'Transfer']) ||
    !!d.deposit_address;
  const routeType = isContractCall || !isTransfer ? 'gmp' : 'transfer';

  if (d.transaction_id) {
    return `/${routeType}/${d.transaction_id}`;
  }
  if (d.transfer_id) {
    return `/${routeType}/?transferId=${d.transfer_id}`;
  }
  return `/${routeType}/`;
}

/** Build the vote suffix label for a participation number */
export function buildVoteSuffix(
  option: string,
  powerDisplay: string,
  isDisplayPower: boolean
): string {
  const abbrev = option === 'unsubmitted'
    ? toTitle(option.substring(0, 2))
    : toTitle(option.substring(0, 1));
  const powerSuffix = isDisplayPower ? `: ${powerDisplay}` : '';
  return ` ${abbrev}${powerSuffix}`;
}

/** Derive eventName from confirmation_events type */
export function deriveEventName(
  currentEventName: string,
  confirmationType: string | undefined
): string {
  switch (confirmationType) {
    case 'depositConfirmation':
      return currentEventName || 'Transfer';
    case 'ContractCallApproved':
      return currentEventName || 'ContractCall';
    case 'ContractCallApprovedWithMint':
    case 'ContractCallWithMintApproved':
      return currentEventName || 'ContractCallWithToken';
    default:
      return confirmationType || '';
  }
}

/** Process raw API poll records into enriched ProcessedPoll objects */
export function processPolls(
  rawData: EVMPollRecord[],
  chains: Chain[] | null
): ProcessedPoll[] {
  return toArray(rawData).map((d: EVMPollRecord) => {
    const votes: PollVote[] = getValuesOfAxelarAddressKey(d).map((v) => {
      const vote = v as PollVote;
      return {
        ...vote,
        option: vote.vote
          ? 'yes'
          : typeof vote.vote === 'boolean'
            ? 'no'
            : 'unsubmitted',
      };
    });

    const voteOptions: VoteOption[] = Object.entries(_.groupBy(votes, 'option'))
      .map(([k, v]: [string, PollVote[]]) => ({
        option: k,
        value: v?.length,
        voters: toArray(v?.map((item: PollVote) => item.voter)),
      }))
      .filter((v) => v.value)
      .map((v) => ({
        ...v,
        i: voteOptionSortIndex(v.option),
      }));

    // add unsubmitted option
    if (
      toArray(d.participants).length > 0 &&
      voteOptions.findIndex((v) => v.option === 'unsubmitted') < 0 &&
      _.sumBy(voteOptions, 'value') < (d.participants as string[]).length
    ) {
      voteOptions.push({
        option: 'unsubmitted',
        value:
          (d.participants as string[]).length - _.sumBy(voteOptions, 'value'),
      });
    }

    let eventName = split(d.event, {
      delimiter: '_',
      toCase: 'lower',
    }).join('_');

    // set eventName and transaction ID from confirmation events
    if (d.confirmation_events) {
      const { type, txID } = { ...d.confirmation_events[0] };
      eventName = deriveEventName(eventName, type);

      if (!d.transaction_id) {
        d.transaction_id = txID;
      }
    }

    const chainExplorer = getChainData(d.sender_chain, chains)?.explorer;
    const { url, transaction_path } = { ...chainExplorer };
    const txhashConfirm = votes.find((v: PollVote) => v.confirmed)?.id;

    return {
      ...d,
      idNumber: isNumber(d.id) ? toNumber(d.id) : d.id,
      status: derivePollStatus(d, txhashConfirm),
      height: _.minBy(votes, 'height')?.height || d.height,
      confirmation_txhash: txhashConfirm,
      votes: _.orderBy(
        votes,
        ['height', 'created_at'],
        ['desc', 'desc']
      ),
      voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
      eventName: d.event
        ? toTitle(eventName, '_', true, true)
        : eventName,
      url: buildPollUrl(eventName, d, url, transaction_path),
    } as ProcessedPoll;
  });
}
