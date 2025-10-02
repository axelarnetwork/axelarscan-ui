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
import { ExplorerLink } from '@/components/ExplorerLink';
import { useGlobalStore } from '@/components/Global';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray, getValuesOfAxelarAddressKey } from '@/lib/parser';
import {
  equalsIgnoreCase,
  headString,
  lastString,
  find,
  ellipse,
  toTitle,
  removeHexPrefix,
} from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';

function Info({ data, id }) {
  const { chains } = useGlobalStore();

  const {
    session_id,
    multisig_prover_contract_address,
    multisig_contract_address,
    message_ids,
    status,
    height,
    initiated_txhash,
    confirmation_txhash,
    completed_txhash,
    expired_height,
    completed_height,
    gateway_txhash,
    participants,
    signOptions,
    created_at,
    updated_at,
  } = { ...data };

  const chain = data?.chain || data?.destination_chain;
  const { url, transaction_path } = {
    ...getChainData(chain, chains)?.explorer,
  };

  return (
    <div className="overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
          <Copy value={chain && session_id ? `${chain}-${session_id}` : id}>
            <span>
              {chain && session_id ? `${chain}-${session_id}` : ellipse(id, 16)}
            </span>
          </Copy>
        </h3>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Chain
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              <ChainProfile value={chain} />
            </dd>
          </div>
          {multisig_prover_contract_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Multisig Prover Contract
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={multisig_prover_contract_address}>
                  {ellipse(multisig_prover_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          {multisig_contract_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Multisig Contract
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={multisig_contract_address}>
                  {ellipse(multisig_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Messages
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              <div className="flex flex-col gap-y-0.5">
                {toArray(
                  message_ids || {
                    message_id: data?.message_id,
                    source_chain: data?.source_chain,
                  }
                ).map((m, i) => {
                  if (!m.message_id) {
                    m.message_id = m.id;
                  }

                  if (!m.source_chain) {
                    m.source_chain = m.chain;
                  }

                  const { url, transaction_path } = {
                    ...getChainData(m.source_chain, chains)?.explorer,
                  };

                  return (
                    m.message_id && (
                      <div key={i} className="flex items-center gap-x-4">
                        <ChainProfile value={m.source_chain} />
                        <div className="flex items-center gap-x-1">
                          <Copy value={removeHexPrefix(m.message_id)}>
                            <Link
                              href={`${url}${transaction_path?.replace('{tx}', headString(removeHexPrefix(m.message_id)))}`}
                              target="_blank"
                              className="font-semibold text-blue-600 dark:text-blue-500"
                            >
                              {ellipse(
                                removeHexPrefix(m.message_id)
                              ).toUpperCase()}
                            </Link>
                          </Copy>
                          <ExplorerLink
                            value={headString(removeHexPrefix(m.message_id))}
                            chain={m.source_chain}
                          />
                        </div>
                      </div>
                    )
                  );
                })}
              </div>
            </dd>
          </div>
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
          {gateway_txhash && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Gateway Tx Hash
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', gateway_txhash)}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  {ellipse(gateway_txhash)}
                </Link>
              </dd>
            </div>
          )}
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
          {confirmation_txhash && confirmation_txhash !== completed_txhash && (
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
                Proof Completed Tx Hash
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
          {completed_height && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Completed Height
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Link
                  href={`/block/${completed_height}`}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500"
                >
                  <Number value={completed_height} />
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
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{`Participants${toArray(participants).length > 1 ? ` (${toArray(participants).length})` : ''}`}</dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              {signOptions && (
                <div className="flex w-fit items-center">
                  {signOptions.map((s, i) => (
                    <Number
                      key={i}
                      value={s.value}
                      format="0,0"
                      suffix={` ${toTitle(s.option.substring(0, ['unsubmitted'].includes(s.option) ? 2 : undefined))}`}
                      noTooltip={true}
                      className={clsx(
                        'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase',
                        ['signed'].includes(s.option)
                          ? 'bg-green-600 text-white dark:bg-green-500'
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                      )}
                    />
                  ))}
                </div>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Signs({ data }) {
  const [signs, setSigns] = useState(null);
  const { verifiers } = useGlobalStore();

  useEffect(() => {
    if (data?.signs) {
      const signs = data.signs.map(d => ({
        ...d,
        verifierData: toArray(verifiers).find(v =>
          equalsIgnoreCase(v.address, d.signer)
        ) || { address: d.signer },
      }));

      setSigns(
        _.concat(
          signs,
          // unsubmitted
          toArray(data.participants)
            .filter(
              p =>
                !find(
                  p,
                  signs.map(s => s.verifierData?.address)
                )
            )
            .map(p => {
              const verifierData = toArray(verifiers).find(v =>
                equalsIgnoreCase(v.address, p)
              );

              return {
                signer: verifierData?.address || p,
                verifierData,
              };
            })
        )
      );
    }
  }, [data, setSigns, verifiers]);

  const { confirmation_txhash } = { ...data };

  return (
    signs && (
      <div className="-mx-4 mt-8 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
            <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left sm:pl-0">
                #
              </th>
              <th scope="col" className="px-3 py-3.5 text-left">
                Signer
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
                Sign
              </th>
              <th scope="col" className="py-3.5 pl-3 pr-4 text-right sm:pr-0">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {signs.map((d, i) => {
              const sign = d.sign ? 'signed' : 'unsubmitted';

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
                      <Copy value={d.signer}>
                        <Link
                          href={`/verifier/${d.signer}`}
                          target="_blank"
                          className="font-medium text-blue-600 dark:text-blue-500"
                        >
                          {ellipse(d.signer, 10, '0x')}
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
                          ['signed'].includes(sign)
                            ? 'bg-green-600 text-white dark:bg-green-500'
                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                        )}
                      >
                        {toTitle(sign)}
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

export function AmplifierProof({ id }) {
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
          ...(await searchAmplifierProofs({
            multisigContractAddress: id.includes('_')
              ? headString(id, '_')
              : undefined,
            sessionId: lastString(id, '_'),
          })),
        };

        let d = data?.[0];

        if (d) {
          const signs = getValuesOfAxelarAddressKey(d).map(s => ({
            ...s,
            option: s.sign ? 'signed' : 'unsubmitted',
          }));

          const signOptions = Object.entries(_.groupBy(signs, 'option'))
            .map(([k, v]) => ({
              option: k,
              value: v?.length,
              signers: toArray(v?.map(d => d.signer)),
            }))
            .filter(s => s.value)
            .map(s => ({
              ...s,
              i: s.option === 'signed' ? 0 : 1,
            }));

          // add unsubmitted option
          if (
            toArray(d.participants).length > 0 &&
            signOptions.findIndex(s => s.option === 'unsubmitted') < 0 &&
            _.sumBy(signOptions, 'value') < d.participants.length
          ) {
            signOptions.push({
              option: 'unsubmitted',
              value: d.participants.length - _.sumBy(signOptions, 'value'),
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
            height: _.minBy(signs, 'height')?.height || d.height,
            signs: _.orderBy(signs, ['height', 'created_at'], ['desc', 'desc']),
            signOptions: _.orderBy(signOptions, ['i'], ['asc']),
          };
        }

        console.log('[data]', d);
        setData({ ...d });
      }
    };

    getData();
  }, [id, setData, blockData]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className="flex max-w-5xl flex-col gap-y-4 sm:gap-y-6">
          <Info data={data} id={id} />
          {verifiers && <Signs data={data} />}
        </div>
      )}
    </Container>
  );
}
