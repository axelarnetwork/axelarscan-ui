'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { getProposals } from '@/lib/api/axelarscan';
import { toArray } from '@/lib/parser';
import { toTitle } from '@/lib/string';
import { toNumber } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';

export function Proposals() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const { data } = { ...(await getProposals()) };
      setData(toArray(data));
    };

    getData();
  }, [setData]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                Proposals
              </h1>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                List of proposals in Axelar Network including ID, title,
                description, type and status.
              </p>
            </div>
          </div>
          <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Proposal
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Type
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left sm:table-cell"
                  >
                    Height
                  </th>
                  <th
                    scope="col"
                    className="hidden whitespace-nowrap px-3 py-3.5 text-left sm:table-cell"
                  >
                    Voting Period
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right sm:table-cell"
                  >
                    Deposit
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {data.map((d, i) => (
                  <tr
                    key={i}
                    className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                  >
                    <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                      {d.proposal_id}
                    </td>
                    <td className="px-3 py-4 text-left">
                      <div className="flex flex-col gap-y-0.5">
                        <Link
                          href={`/proposal/${d.proposal_id}`}
                          target="_blank"
                          className="max-w-xs whitespace-pre-wrap break-words font-display font-semibold text-blue-600 dark:text-blue-500 sm:max-w-sm"
                        >
                          {d.content?.title || d.content?.plan?.name}
                        </Link>
                        <span className="max-w-xs whitespace-pre-wrap break-words text-zinc-400 dark:text-zinc-500 sm:max-w-sm">
                          {d.content?.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      {d.type && <Tag className="w-fit">{d.type}</Tag>}
                    </td>
                    <td className="hidden px-3 py-4 text-left sm:table-cell">
                      <Number value={d.content?.plan?.height} />
                    </td>
                    <td className="hidden px-3 py-4 text-left sm:table-cell">
                      <div className="mt-1 flex flex-col gap-y-1">
                        {[d.voting_start_time, d.voting_end_time].map(
                          (t, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-1.5"
                            >
                              <div className="w-8 text-xs">
                                {i === 0 ? 'From' : 'To'}:
                              </div>
                              <span className="whitespace-nowrap text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {moment(t).format(TIME_FORMAT)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="hidden px-3 py-4 text-right sm:table-cell">
                      <div className="flex flex-col items-end gap-y-1">
                        {toArray(d.total_deposit).map((d, i) => (
                          <Number
                            key={i}
                            value={d.amount}
                            suffix={` ${d.symbol}`}
                            noTooltip={true}
                            className="font-medium text-zinc-700 dark:text-zinc-300"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pl-3 pr-4 text-right sm:pr-0">
                      {d.status && (
                        <div className="flex flex-col items-end gap-y-1">
                          <Tag
                            className={clsx(
                              'w-fit',
                              ['UNSPECIFIED', 'DEPOSIT_PERIOD'].includes(
                                d.status
                              )
                                ? ''
                                : ['VOTING_PERIOD'].includes(d.status)
                                  ? 'bg-yellow-400 dark:bg-yellow-500'
                                  : ['REJECTED', 'FAILED'].includes(d.status)
                                    ? 'bg-red-600 dark:bg-red-500'
                                    : 'bg-green-600 dark:bg-green-500'
                            )}
                          >
                            {d.status}
                          </Tag>
                          {['PASSED', 'REJECTED'].includes(d.status) && (
                            <div className="flex flex-col items-end gap-y-0.5">
                              {Object.entries({ ...d.final_tally_result })
                                .filter(([k, v]) => toNumber(v) >= 0)
                                .map(([k, v]) => (
                                  <Number
                                    key={k}
                                    value={v}
                                    format="0,0.00a"
                                    prefix={`${toTitle(k)}: `}
                                    noTooltip={true}
                                    className="font-medium capitalize text-zinc-400 dark:text-zinc-500"
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
