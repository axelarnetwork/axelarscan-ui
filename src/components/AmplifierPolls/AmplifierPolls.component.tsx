'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink, buildExplorerURL } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean, ellipse, toTitle } from '@/lib/string';
import type { AmplifierPollEntry, PollVote, PollVoteOption } from './AmplifierPolls.types';
import { Filters } from './Filters.component';
import * as styles from './AmplifierPolls.styles';

const size = 25;

function getStatusStyle(status: string): string {
  if (status === 'completed') return styles.statusCompleted;
  if (status === 'failed') return styles.statusFailed;
  if (status === 'expired') return styles.statusExpired;
  return styles.statusPending;
}

function getVoteOptionStyle(option: string): string {
  if (option === 'no') return styles.voteOptionNo;
  if (option === 'yes') return styles.voteOptionYes;
  return styles.voteOptionDefault;
}

function deriveStatus(
  d: AmplifierPollEntry,
  latestBlockHeight: number,
): string {
  if (d.success) return 'completed';
  if (d.failed) return 'failed';
  if (d.expired || (d.expired_height ?? 0) < latestBlockHeight) return 'expired';
  return 'pending';
}

function getVoteOptionSortIndex(option: string): number {
  if (option === 'yes') return 0;
  if (option === 'no') return 1;
  return 2;
}

function buildVoteOptions(
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

function processPollData(
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

export function AmplifierPolls() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<
    string,
    { data: AmplifierPollEntry[]; total: number }
  > | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [blockData, setBlockData] = useState<{
    latest_block_height?: number;
    [key: string]: unknown;
  } | null>(null);
  const chains = useChains();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () =>
      setBlockData((await getRPCStatus()) as Record<string, unknown>);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh) || !blockData) return;

      const response = (await searchAmplifierPolls({ ...params, size })) as
        | { data?: AmplifierPollEntry[]; total?: number }
        | undefined;
      const { data, total } = { ...response };

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: processPollData(
            toArray(data) as AmplifierPollEntry[],
            blockData.latest_block_height ?? 0,
          ),
          total: total ?? 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, blockData, chains]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, total } = {
    ...searchResults?.[generateKeyByParams(params as any)],
  };

  if (!data) {
    return (
      <Container className={styles.containerClass}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.containerClass}>
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerAuto}>
            <div className={styles.headingRow}>
              <Link href="/evm-polls" className={styles.evmPollsLink}>
                EVM Polls
              </Link>
              <span className={styles.titleSeparator}>|</span>
              <h1 className={styles.pageTitle}>Amplifier Polls</h1>
            </div>
            <p className={styles.resultText}>
              <Number
                value={total}
                suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className={styles.actionsRow}>
            <Filters />
            {refresh ? (
              <Spinner />
            ) : (
              <Button
                color="default"
                circle="true"
                onClick={() => setRefresh(true)}
              >
                <MdOutlineRefresh size={20} />
              </Button>
            )}
          </div>
        </div>
        {refresh && <Overlay />}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th scope="col" className={styles.thFirst}>
                  ID
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Chain
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Height
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Status
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Participations
                </th>
                <th scope="col" className={styles.thLast}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d: AmplifierPollEntry) => (
                <PollRow key={d.id} poll={d} chains={chains} />
              ))}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

function PollRow({
  poll,
  chains,
}: {
  poll: AmplifierPollEntry;
  chains: ReturnType<typeof useChains>;
}) {
  const explorer = {
    ...getChainData(poll.sender_chain, chains)?.explorer,
  };
  const txHref = buildExplorerURL({
    value: poll.transaction_id,
    type: 'tx',
    useContractLink: false,
    hasEventLog: false,
    explorer,
  });

  return (
    <tr className={styles.tr}>
      <td className={styles.tdFirst}>
        <div className={styles.cellColumn}>
          <Copy value={poll.poll_id}>
            <Link
              href={`/amplifier-poll/${poll.id}`}
              target="_blank"
              className={styles.pollLink}
            >
              {poll.poll_id}
            </Link>
          </Copy>
          {poll.transaction_id && (
            <div className={styles.txRow}>
              <Copy value={poll.transaction_id}>
                <Link
                  href={txHref}
                  target="_blank"
                  className={styles.pollLink}
                >
                  {ellipse(poll.transaction_id)}
                </Link>
              </Copy>
              <ExplorerLink
                value={poll.transaction_id}
                chain={poll.sender_chain}
              />
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.cellColumn}>
          <ChainProfile value={poll.sender_chain} />
          {poll.contract_address && (
            <div className="flex items-center">
              <Tooltip
                content="Verifier Contract"
                className={styles.verifierTooltip}
              >
                <Copy value={poll.contract_address}>
                  {ellipse(poll.contract_address)}
                </Copy>
              </Tooltip>
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        {poll.height && (
          <Link
            href={`/block/${poll.height}`}
            target="_blank"
            className={styles.blockLink}
          >
            <Number value={poll.height} />
          </Link>
        )}
      </td>
      <td className={styles.tdMiddle}>
        <div className={styles.statusColumn}>
          {poll.status && (
            <Tag
              className={clsx(
                styles.statusTagBase,
                getStatusStyle(poll.status),
              )}
            >
              {poll.status}
            </Tag>
          )}
        </div>
      </td>
      <td className={styles.tdMiddle}>
        <Link
          href={`/amplifier-poll/${poll.id}`}
          target="_blank"
          className={styles.participationLink}
        >
          {poll.voteOptions?.map((v: PollVoteOption, i: number) => (
            <Number
              key={i}
              value={v.value}
              format="0,0"
              suffix={` ${toTitle(v.option.substring(0, v.option === 'unsubmitted' ? 2 : 1))}`}
              noTooltip={true}
              className={clsx(
                styles.voteOptionBase,
                getVoteOptionStyle(v.option),
              )}
            />
          ))}
        </Link>
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={poll.created_at?.ms} />
      </td>
    </tr>
  );
}
