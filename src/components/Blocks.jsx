'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { searchBlocks } from '@/lib/api/validator';
import { toBoolean, ellipse } from '@/lib/string';
import { numberFormat } from '@/lib/number';

const SIZE = 250;

export function Blocks({ height }) {
  const [data, setData] = useState(null);
  const [refresh, setRefresh] = useState(null);

  useEffect(() => {
    const getData = async () => {
      if (toBoolean(refresh)) {
        const { data } = { ...(await searchBlocks({ height, size: SIZE })) };

        if (data) {
          setData(data);
          setRefresh(false);
        }
      }
    };

    getData();
  }, [height, setData, refresh, setRefresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh(true), 6 * 1000);
    return () => clearInterval(interval);
  }, [setRefresh]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              Blocks
            </h1>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
              Latest {numberFormat(SIZE, '0,0')} Blocks
            </p>
          </div>
          <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    Height
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Hash
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Proposer
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-right"
                  >
                    No. Transactions
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {data.map((d, i) => (
                  <tr
                    key={d.height}
                    className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                  >
                    <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                      <div className="flex flex-col gap-y-0.5">
                        <Copy value={d.height}>
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className="font-semibold text-blue-600 dark:text-blue-500"
                          >
                            <Number value={d.height} />
                          </Link>
                        </Copy>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      {d.hash && (
                        <Copy value={d.hash}>
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className="font-medium text-blue-600 dark:text-blue-500"
                          >
                            {ellipse(d.hash)}
                          </Link>
                        </Copy>
                      )}
                    </td>
                    <td className="px-3 py-4 text-left">
                      <Profile i={i} address={d.proposer_address} />
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Number
                        value={d.num_txs}
                        className="font-medium text-zinc-700 dark:text-zinc-300"
                      />
                    </td>
                    <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                      <TimeAgo timestamp={d.time} />
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
