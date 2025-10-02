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
import { useGlobalStore } from '@/components/Global';
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

function Info({ data, id }) {
  const { chains } = useGlobalStore();

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
    <div className="overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
          <Copy value={data?.poll_id || id}>
            <span>{data?.poll_id || ellipse(id, 16)}</span>
          </Copy>
        </h3>
        <div className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400 dark:text-zinc-500">
          {transaction_id && (
            <div className="flex items-center gap-x-1">
              <Copy value={transaction_id}>
                <Link
                  href={txHref}
                  target="_blank"
                  className="font-semibold text-blue-600 dark:text-blue-500"
                >
                  {ellipse(transaction_id)}
                  {isNumber(event_index) ? `-${event_index}` : ''}
                </Link>
              </Copy>
              <ExplorerLink value={transaction_id} chain={sender_chain} />
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Chain
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              <ChainProfile value={sender_chain} />
            </dd>
          </div>
          {contract_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Verifier Contract
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={contract_address}>
                  {ellipse(contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Status
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              {status && (
                <Tag
                  className={clsx(
                    'w-fit capitalize',
                    ['completed'].includes(status)
                      ? 'bg-green-600 dark:bg-green-500'
                      : ['failed'].includes(status)
                        ? 'bg-red-600 dark:bg-red-500'
                        : ['expired'].includes(status)
                          ? 'bg-zinc-400 dark:bg-zinc-500'
                          : 'bg-yellow-400 dark:bg-yellow-500'
                  )}
                >
                  {status}
                </Tag>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Height
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              {height && (
                <Link
                  href={`/block/${height}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  <Number value={height} />
                </Link>
              )}
            </dd>
          </div>
          {initiated_txhash && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Initiated Tx Hash
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Link
                  href={`/tx/${initiated_txhash}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  {ellipse(initiated_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {confirmation_txhash && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Confirmation Tx Hash
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Link
                  href={`/tx/${confirmation_txhash}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  {ellipse(confirmation_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {completed_txhash && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Poll Completed Tx Hash
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Link
                  href={`/tx/${completed_txhash}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  {ellipse(completed_txhash)}
                </Link>
              </dd>
            </div>
          )}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Expires Height
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              {expired_height && (
                <Link
                  href={`/block/${expired_height}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  <Number value={expired_height} />
                </Link>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Created
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {updated_at?.ms > created_at?.ms && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Updated
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                {moment(updated_at.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          {participants && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{`Participants${participants.length > 1 ? ` (${participants.length})` : ''}`}</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <div className="flex w-fit items-center">
                  {voteOptions.map((v, i) => (
                    <Number
                      key={i}
                      value={v.value}
                      format="0,0"
                      suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}`}
                      noTooltip={true}
                      className={clsx(
                        'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase',
                        ['no'].includes(v.option)
                          ? 'bg-red-600 text-white dark:bg-red-500'
                          : ['yes'].includes(v.option)
                            ? 'bg-green-600 text-white dark:bg-green-500'
                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
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

function Votes({ data }) {
  const [votes, setVotes] = useState(null);
  const { verifiers } = useGlobalStore();

  useEffect(() => {
    if (data?.votes) {
      const votes = data.votes.map(d => ({
        ...d,
        verifierData: toArray(verifiers).find(v =>
          equalsIgnoreCase(v.address, d.voter)
        ) || { address: d.voter },
      }));

      setVotes(
        _.concat(
          votes,
          // unsubmitted
          toArray(data.participants)
            .filter(
              p =>
                !find(
                  p,
                  votes.map(v => v.verifierData?.address)
                )
            )
            .map(p => {
              const verifierData = toArray(verifiers).find(v =>
                equalsIgnoreCase(v.address, p)
              );

              return {
                voter: verifierData?.address || p,
                verifierData,
              };
            })
        )
      );
    }
  }, [data, setVotes, verifiers]);

  const { confirmation_txhash } = { ...data };

  return (
    votes && (
      <div className="-mx-4 mt-8 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
            <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left sm:pl-0">
                #
              </th>
              <th scope="col" className="px-3 py-3.5 text-left">
                Voter
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-3 py-3.5 text-left"
              >
                Tx Hash
              </th>
              <th scope="col" className="px-3 py-3.5 text-left">
                Height
              </th>
              <th scope="col" className="px-3 py-3.5 text-right">
                Vote
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-4 text-right sm:pr-0">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {votes.map((d, i) => {
              const vote = d.vote
                ? 'yes'
                : typeof d.vote === 'boolean'
                  ? 'no'
                  : 'unsubmitted';

              return (
                <tr
                  key={i}
                  className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                >
                  <td className="py-4 pl-4 pr-3 text-left sm:pl-0">{i + 1}</td>
                  <td className="px-3 py-4 text-left">
                    {d.verifierData ? (
                      <Profile i={i} address={d.verifierData.address} />
                    ) : (
                      <Copy value={d.voter}>
                        <Link
                          href={`/verifier/${d.voter}`}
                          target="_blank"
                          className="font-medium text-blue-600 dark:text-blue-500"
                        >
                          {ellipse(d.voter, 10, '0x')}
                        </Link>
                      </Copy>
                    )}
                  </td>
                  <td className="px-3 py-4 text-left">
                    {d.id && (
                      <div className="flex flex-col gap-y-1">
                        <Copy value={d.id}>
                          <Link
                            href={`/tx/${d.id}`}
                            target="_blank"
                            className="font-medium text-blue-600 dark:text-blue-500"
                          >
                            {ellipse(d.id, 6)}
                          </Link>
                        </Copy>
                        {equalsIgnoreCase(d.id, confirmation_txhash) && (
                          <Link
                            href={`/tx/${confirmation_txhash}`}
                            target="_blank"
                            className="flex h-6 items-center gap-x-1"
                          >
                            <IoCheckmarkDoneCircle
                              size={18}
                              className="text-green-600 dark:text-green-500"
                            />
                            <span className="text-zinc-400 dark:text-zinc-500">
                              Confirmation
                            </span>
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 text-left">
                    {d.height && (
                      <Link
                        href={`/block/${d.height}`}
                        target="_blank"
                        className="font-medium text-blue-600 dark:text-blue-500"
                      >
                        <Number value={d.height} />
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <Tag
                        className={clsx(
                          'w-fit capitalize',
                          ['no'].includes(vote)
                            ? 'bg-red-600 text-white dark:bg-red-500'
                            : ['yes'].includes(vote)
                              ? 'bg-green-600 text-white dark:bg-green-500'
                              : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                        )}
                      >
                        {toTitle(vote)}
                      </Tag>
                    </div>
                  </td>
                  <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
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

export function AmplifierPoll({ id }) {
  const [data, setData] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const { chains, verifiers } = useGlobalStore();

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus());
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (blockData) {
        const { data } = {
          ...(await searchAmplifierPolls({
            verifierContractAddress: id.includes('_')
              ? headString(id, '_')
              : undefined,
            pollId: lastString(id, '_'),
          })),
        };

        let d = data?.[0];

        if (d) {
          const votes = getValuesOfAxelarAddressKey(d).map(v => ({
            ...v,
            option: v.vote
              ? 'yes'
              : typeof v.vote === 'boolean'
                ? 'no'
                : 'unsubmitted',
          }));

          const voteOptions = Object.entries(_.groupBy(votes, 'option'))
            .map(([k, v]) => ({
              option: k,
              value: v?.length,
              voters: toArray(v?.map(d => d.voter)),
            }))
            .filter(v => v.value)
            .map(v => ({
              ...v,
              i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2,
            }));

          // add unsubmitted option
          if (
            toArray(d.participants).length > 0 &&
            voteOptions.findIndex(v => v.option === 'unsubmitted') < 0 &&
            _.sumBy(voteOptions, 'value') < d.participants.length
          ) {
            voteOptions.push({
              option: 'unsubmitted',
              value: d.participants.length - _.sumBy(voteOptions, 'value'),
            });
          }

          d = {
            ...d,
            status: d.success
              ? 'completed'
              : d.failed
                ? 'failed'
                : d.expired || d.expired_height < blockData.latest_block_height
                  ? 'expired'
                  : 'pending',
            height: _.minBy(votes, 'height')?.height || d.height,
            votes: _.orderBy(votes, ['height', 'created_at'], ['desc', 'desc']),
            voteOptions: _.orderBy(voteOptions, ['i'], ['asc']),
            url: `/gmp/${d.transaction_id || 'search'}`,
          };
        }

        console.log('[data]', d);
        setData({ ...d });
      }
    };

    getData();
  }, [id, setData, blockData, chains]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className="flex max-w-5xl flex-col gap-y-4 sm:gap-y-6">
          <Info data={data} id={id} />
          {verifiers && <Votes data={data} />}
        </div>
      )}
    </Container>
  );
}
