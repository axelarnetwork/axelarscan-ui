'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Container } from '@/components/Container';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { ExplorerLink, buildExplorerURL } from '@/components/ExplorerLink';
import { useChains, useVerifiers } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import {
  equalsIgnoreCase,
  headString,
  lastString,
  find,
  ellipse,
  toTitle,
} from '@/lib/string';
import { isNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import * as styles from './AmplifierPoll.styles';

interface VoteOption {
  option: string;
  value: number;
  voters?: string[];
  i?: number;
}

interface PollVote {
  voter?: string;
  vote?: boolean;
  height?: number;
  id?: string;
  created_at?: number;
  option?: string;
  confirmed?: boolean;
  verifierData?: VerifierEntry;
}

interface VerifierEntry {
  address?: string;
  [key: string]: unknown;
}

interface Timestamp {
  ms?: number;
}

interface AmplifierPollData {
  poll_id?: string;
  contract_address?: string;
  transaction_id?: string;
  event_index?: number;
  sender_chain?: string;
  status?: string;
  height?: number;
  initiated_txhash?: string;
  confirmation_txhash?: string;
  completed_txhash?: string;
  expired_height?: number;
  participants?: string[];
  voteOptions?: VoteOption[];
  votes?: PollVote[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  url?: string;
  [key: string]: unknown;
}

interface RPCStatusData {
  latest_block_height?: number;
  [key: string]: unknown;
}

function Info({ data, id }: { data: AmplifierPollData; id: string }) {
  const chains = useChains();

  const {
    contract_address,
    transaction_id,
    event_index,
    sender_chain,
    status,
    height,
    initiated_txhash,
    confirmation_txhash,
    completed_txhash,
    expired_height,
    participants,
    voteOptions,
    created_at,
    updated_at,
  } = { ...data };

  const explorer = { ...getChainData(sender_chain, chains)?.explorer };

  const txHref = buildExplorerURL({
    value: transaction_id,
    type: 'tx',
    useContractLink: false,
    hasEventLog: false,
    explorer,
  });

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={data?.poll_id || id}>
            <span>{data?.poll_id || ellipse(id, 16)}</span>
          </Copy>
        </h3>
        <div className={styles.infoSubtitle}>
          {transaction_id && (
            <div className={styles.txIdWrapper}>
              <Copy value={transaction_id}>
                <Link href={txHref} target="_blank" className={styles.txLink}>
                  {ellipse(transaction_id)}
                  {isNumber(event_index) ? `-${event_index}` : ''}
                </Link>
              </Copy>
              <ExplorerLink value={transaction_id} chain={sender_chain} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.dlDivide}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Chain</dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={sender_chain} />
            </dd>
          </div>
          {contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Verifier Contract</dt>
              <dd className={styles.ddValue}>
                <Copy value={contract_address}>{ellipse(contract_address)}</Copy>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Status</dt>
            <dd className={styles.ddValue}>
              {status && (
                <Tag
                  className={clsx(
                    'w-fit capitalize',
                    ['completed'].includes(status)
                      ? styles.statusCompleted
                      : ['failed'].includes(status)
                        ? styles.statusFailed
                        : ['expired'].includes(status)
                          ? styles.statusExpired
                          : styles.statusPending
                  )}
                >
                  {status}
                </Tag>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Height</dt>
            <dd className={styles.ddValue}>
              {height && (
                <Link href={`/block/${height}`} target="_blank" className={styles.blockLink}>
                  <Number value={height} />
                </Link>
              )}
            </dd>
          </div>
          {initiated_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Initiated Tx Hash</dt>
              <dd className={styles.ddValue}>
                <Link href={`/tx/${initiated_txhash}`} target="_blank" className={styles.blockLink}>
                  {ellipse(initiated_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {confirmation_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Confirmation Tx Hash</dt>
              <dd className={styles.ddValue}>
                <Link href={`/tx/${confirmation_txhash}`} target="_blank" className={styles.blockLink}>
                  {ellipse(confirmation_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {completed_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Poll Completed Tx Hash</dt>
              <dd className={styles.ddValue}>
                <Link href={`/tx/${completed_txhash}`} target="_blank" className={styles.blockLink}>
                  {ellipse(completed_txhash)}
                </Link>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Expires Height</dt>
            <dd className={styles.ddValue}>
              {expired_height && (
                <Link href={`/block/${expired_height}`} target="_blank" className={styles.blockLink}>
                  <Number value={expired_height} />
                </Link>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Created</dt>
            <dd className={styles.ddValue}>
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {(updated_at?.ms ?? 0) > (created_at?.ms ?? 0) && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Updated</dt>
              <dd className={styles.ddValue}>
                {moment(updated_at!.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          {participants && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>{`Participants${participants.length > 1 ? ` (${participants.length})` : ''}`}</dt>
              <dd className={styles.ddValue}>
                <div className={styles.participantVotes}>
                  {voteOptions!.map((v: VoteOption, i: number) => (
                    <Number
                      key={i}
                      value={v.value}
                      format="0,0"
                      suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}`}
                      noTooltip={true}
                      className={clsx(
                        styles.voteOptionTag,
                        ['no'].includes(v.option)
                          ? styles.voteOptionNo
                          : ['yes'].includes(v.option)
                            ? styles.voteOptionYes
                            : styles.voteOptionDefault
                      )}
                    />
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function Votes({ data }: { data: AmplifierPollData }) {
  const [votes, setVotes] = useState<PollVote[] | null>(null);
  const verifiers = useVerifiers();

  useEffect(() => {
    if (data?.votes) {
      const mappedVotes: PollVote[] = data.votes.map(d => ({
        ...d,
        verifierData: (toArray(verifiers) as VerifierEntry[]).find(v =>
          equalsIgnoreCase(v.address, d.voter)
        ) || { address: d.voter },
      }));

      const unsubmitted: PollVote[] = (toArray(data.participants) as string[])
        .filter(
          p =>
            !find(
              p,
              mappedVotes.map(v => v.verifierData?.address).filter(Boolean) as string[]
            )
        )
        .map(p => {
          const verifierData = (toArray(verifiers) as VerifierEntry[]).find(v =>
            equalsIgnoreCase(v.address, p)
          );
          return {
            voter: verifierData?.address || p,
            verifierData,
          };
        });

      setVotes(_.concat(mappedVotes, unsubmitted));
    }
  }, [data, verifiers]);

  const { confirmation_txhash } = { ...data };

  return (
    votes && (
      <div className={styles.votesWrapper}>
        <table className={styles.votesTable}>
          <thead className={styles.votesThead}>
            <tr className={styles.votesTheadRow}>
              <th scope="col" className={styles.votesThFirst}>#</th>
              <th scope="col" className={styles.votesTh}>Voter</th>
              <th scope="col" className={styles.votesThWrap}>Tx Hash</th>
              <th scope="col" className={styles.votesTh}>Height</th>
              <th scope="col" className={styles.votesThRight}>Vote</th>
              <th scope="col" className={styles.votesThLast}>Time</th>
            </tr>
          </thead>
          <tbody className={styles.votesTbody}>
            {votes.map((d: PollVote, i: number) => {
              const vote = d.vote
                ? 'yes'
                : typeof d.vote === 'boolean'
                  ? 'no'
                  : 'unsubmitted';

              return (
                <tr key={i} className={styles.votesRow}>
                  <td className={styles.votesTdFirst}>{i + 1}</td>
                  <td className={styles.votesTd}>
                    {d.verifierData ? (
                      <Profile i={i} address={d.verifierData.address} />
                    ) : (
                      <Copy value={d.voter}>
                        <Link
                          href={`/verifier/${d.voter}`}
                          target="_blank"
                          className={styles.voterLink}
                        >
                          {ellipse(d.voter, 10, '0x')}
                        </Link>
                      </Copy>
                    )}
                  </td>
                  <td className={styles.votesTd}>
                    {d.id && (
                      <div className={styles.txHashColumn}>
                        <Copy value={d.id}>
                          <Link
                            href={`/tx/${d.id}`}
                            target="_blank"
                            className={styles.voterLink}
                          >
                            {ellipse(d.id, 6)}
                          </Link>
                        </Copy>
                        {equalsIgnoreCase(d.id, confirmation_txhash) && (
                          <Link
                            href={`/tx/${confirmation_txhash}`}
                            target="_blank"
                            className={styles.confirmationLink}
                          >
                            <IoCheckmarkDoneCircle
                              size={18}
                              className={styles.confirmationIcon}
                            />
                            <span className={styles.confirmationText}>
                              Confirmation
                            </span>
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                  <td className={styles.votesTd}>
                    {d.height && (
                      <Link
                        href={`/block/${d.height}`}
                        target="_blank"
                        className={styles.blockLink}
                      >
                        <Number value={d.height} />
                      </Link>
                    )}
                  </td>
                  <td className={styles.votesTdRight}>
                    <div className={styles.voteTagWrapper}>
                      <Tag
                        className={clsx(
                          'w-fit capitalize',
                          ['no'].includes(vote)
                            ? styles.voteOptionNo
                            : ['yes'].includes(vote)
                              ? styles.voteOptionYes
                              : styles.voteOptionDefault
                        )}
                      >
                        {toTitle(vote)}
                      </Tag>
                    </div>
                  </td>
                  <td className={styles.votesTdLast}>
                    <TimeAgo timestamp={d.created_at} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )
  );
}

export function AmplifierPoll({ id }: { id: string }) {
  const [data, setData] = useState<AmplifierPollData | null>(null);
  const [blockData, setBlockData] = useState<RPCStatusData | null>(null);
  const chains = useChains();
  const verifiers = useVerifiers();

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as RPCStatusData);
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (blockData) {
        const response = await searchAmplifierPolls({
            verifierContractAddress: id.includes('_')
              ? headString(id, '_')
              : undefined,
            pollId: lastString(id, '_'),
          }) as { data?: AmplifierPollData[] } | undefined;

        let d = response?.data?.[0];

        if (d) {
          const pollVotes = (getValuesOfAxelarAddressKey(d as unknown as Record<string, unknown>) as PollVote[]).map(v => ({
            ...v,
            option: v.vote
              ? 'yes'
              : typeof v.vote === 'boolean'
                ? 'no'
                : 'unsubmitted',
          }));

          const voteOptions: VoteOption[] = Object.entries(_.groupBy(pollVotes, 'option'))
            .map(([k, v]) => ({
              option: k,
              value: v?.length,
              voters: toArray(v?.map(item => item.voter)) as string[],
            }))
            .filter(v => v.value)
            .map(v => ({
              ...v,
              i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2,
            }));

          if (
            toArray(d.participants).length > 0 &&
            voteOptions.findIndex(v => v.option === 'unsubmitted') < 0 &&
            _.sumBy(voteOptions, 'value') < (d.participants?.length ?? 0)
          ) {
            voteOptions.push({
              option: 'unsubmitted',
              value: (d.participants?.length ?? 0) - _.sumBy(voteOptions, 'value'),
            });
          }

          d = {
            ...d,
            status: d.success
              ? 'completed'
              : d.failed
                ? 'failed'
                : d.expired || (d.expired_height ?? 0) < (blockData.latest_block_height ?? 0)
                  ? 'expired'
                  : 'pending',
            height: _.minBy(pollVotes, 'height')?.height || d.height,
            votes: _.orderBy(pollVotes, ['height', 'created_at'], ['desc', 'desc']),
            voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
            url: `/gmp/${d.transaction_id || 'search'}`,
          };
        }

        console.log('[data]', d);
        setData({ ...d } as AmplifierPollData);
      }
    };

    getData();
  }, [id, blockData, chains]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className={styles.mainLayout}>
          <Info data={data} id={id} />
          {verifiers && <Votes data={data} />}
        </div>
      )}
    </Container>
  );
}
