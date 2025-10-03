'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Linkify from 'react-linkify';
import clsx from 'clsx';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TablePagination } from '@/components/Pagination';
import { useValidatorStore } from '@/components/Validators';
import { useGlobalStore } from '@/components/Global';
import { getBalances } from '@/lib/api/axelarscan';
import {
  getRPCStatus,
  searchUptimes,
  searchProposedBlocks,
  searchHeartbeats,
  searchEVMPolls,
  getChainMaintainers,
  getValidatorDelegations,
} from '@/lib/api/validator';
import { ENVIRONMENT, getChainData, getAssetData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  find,
  includesSomePatterns,
  ellipse,
} from '@/lib/string';
import { isNumber, toNumber, numberFormat } from '@/lib/number';

function Info({ data, address, delegations }) {
  const delegationsSizePerPage = 10;

  const [delegationsPage, setDelegationsPage] = useState(1);
  const { chains, assets, validators } = useGlobalStore();

  const {
    operator_address,
    consensus_address,
    delegator_address,
    broadcaster_address,
    broadcasterBalance,
    status,
    tokens,
    quadratic_voting_power,
    supportedChains,
  } = { ...data };
  const { details, website } = { ...data?.description };
  const { rate } = { ...data?.commission?.commission_rates };

  const totalVotingPower = _.sumBy(
    toArray(validators).filter(d => d.status === 'BOND_STATUS_BONDED'),
    'tokens'
  );
  const totalQuadraticVotingPower = _.sumBy(
    toArray(validators).filter(d => d.status === 'BOND_STATUS_BONDED'),
    'quadratic_voting_power'
  );

  return (
    <div className="overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
          <Profile address={address} width={32} height={32} />
        </h3>
        <div className="mt-1 flex flex-col">
          {details && (
            <div className="linkify max-w-xl whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400 dark:text-zinc-500">
              <Linkify>{details}</Linkify>
            </div>
          )}
          {website && (
            <Link
              href={website}
              target="_blank"
              className="text-sm text-blue-600 dark:text-blue-500"
            >
              {website}
            </Link>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {operator_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Operator Address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={operator_address}>
                  <span>{ellipse(operator_address, 10, 'axelarvaloper')}</span>
                </Copy>
              </dd>
            </div>
          )}
          {consensus_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Consensus Address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={consensus_address}>
                  <span>{ellipse(consensus_address, 10, 'axelarvalcons')}</span>
                </Copy>
              </dd>
            </div>
          )}
          {delegator_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Delegator Address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={delegator_address}>
                  <Link
                    href={`/account/${delegator_address}`}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-500"
                  >
                    {ellipse(delegator_address, 14, 'axelar')}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          {broadcaster_address && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Broadcaster Address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <div className="flex flex-col items-start gap-y-1">
                  <Copy value={broadcaster_address}>
                    <Link
                      href={`/account/${broadcaster_address}`}
                      target="_blank"
                      className="text-blue-600 dark:text-blue-500"
                    >
                      {ellipse(broadcaster_address, 14, 'axelar')}
                    </Link>
                  </Copy>
                  {isNumber(broadcasterBalance?.amount) && (
                    <Number
                      value={broadcasterBalance.amount}
                      suffix={` ${broadcasterBalance.symbol}`}
                      className={clsx(
                        'font-medium',
                        broadcasterBalance.amount < 5
                          ? 'text-red-600 dark:text-red-500'
                          : 'text-green-600 dark:text-green-500'
                      )}
                    />
                  )}
                </div>
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
                    'w-fit',
                    status.includes('UN')
                      ? status.endsWith('ED')
                        ? 'bg-red-600 dark:bg-red-500'
                        : 'bg-orange-500 dark:bg-orange-600'
                      : 'bg-green-600 dark:bg-green-500'
                  )}
                >
                  {status.replace('BOND_STATUS_', '')}
                </Tag>
              )}
            </dd>
          </div>
          {isNumber(rate) && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Commission
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Number
                  value={rate * 100}
                  maxDecimals={2}
                  suffix="%"
                  noTooltip={true}
                  className="font-medium"
                />
              </dd>
            </div>
          )}
          {isNumber(tokens) && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {status === 'BOND_STATUS_BONDED'
                  ? 'Consensus Power'
                  : 'Staking'}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <div className="flex items-center gap-x-2">
                  <Number
                    value={tokens}
                    format="0,0.0a"
                    noTooltip={true}
                    className="font-medium text-zinc-900 dark:text-zinc-100"
                  />
                  {status === 'BOND_STATUS_BONDED' && (
                    <Number
                      value={(tokens * 100) / totalVotingPower}
                      format="0,0.0a"
                      prefix="("
                      suffix="%)"
                      noTooltip={true}
                      className="text-zinc-400 dark:text-zinc-500"
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
          {isNumber(quadratic_voting_power) &&
            status === 'BOND_STATUS_BONDED' && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Quadratic Power
                </dt>
                <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center gap-x-2">
                    <Number
                      value={quadratic_voting_power}
                      format="0,0.0a"
                      noTooltip={true}
                      className="font-medium text-zinc-900 dark:text-zinc-100"
                    />
                    <Number
                      value={
                        (quadratic_voting_power * 100) /
                        totalQuadraticVotingPower
                      }
                      format="0,0.0a"
                      prefix="("
                      suffix="%)"
                      noTooltip={true}
                      className="text-zinc-400 dark:text-zinc-500"
                    />
                  </div>
                </dd>
              </div>
            )}
          {supportedChains && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                EVM Supported
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <div className="flex flex-wrap">
                  {supportedChains.map((c, i) => {
                    const { name, image } = { ...getChainData(c, chains) };

                    return (
                      <Tooltip
                        key={i}
                        content={name}
                        className="whitespace-nowrap"
                      >
                        <Image
                          src={image}
                          alt=""
                          width={20}
                          height={20}
                          className="mb-1.5 mr-1.5"
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              </dd>
            </div>
          )}
          {delegations && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{`Delegation${delegations.length > 1 ? `s (${numberFormat(delegations.length, '0,0')})` : ''}`}</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <div className="flex flex-col gap-y-4">
                  <div className="-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                      <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                        <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                          <th
                            scope="col"
                            className="py-2.5 pl-4 pr-3 text-left sm:pl-3"
                          >
                            Delegator
                          </th>
                          <th scope="col" className="px-3 py-2.5 text-right">
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2.5 pl-3 pr-4 text-right sm:pr-3"
                          >
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                        {delegations
                          .filter(
                            (d, i) =>
                              i >=
                                (delegationsPage - 1) *
                                  delegationsSizePerPage &&
                              i < delegationsPage * delegationsSizePerPage
                          )
                          .map((d, i) => {
                            const { price } = {
                              ...getAssetData(d.denom, assets),
                            };

                            return (
                              <tr
                                key={i}
                                className="align-top text-xs text-zinc-400 dark:text-zinc-500"
                              >
                                <td className="py-3 pl-4 pr-3 text-left sm:pl-3">
                                  <Copy size={14} value={d.delegator_address}>
                                    <Link
                                      href={`/account/${d.delegator_address}`}
                                      target="_blank"
                                      className="font-medium text-blue-600 dark:text-blue-500"
                                    >
                                      {ellipse(
                                        d.delegator_address,
                                        6,
                                        'axelar'
                                      )}
                                    </Link>
                                  </Copy>
                                </td>
                                <td className="px-3 py-3 text-right">
                                  <div className="flex items-center justify-end">
                                    <Number
                                      value={d.amount}
                                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 pl-3 pr-4 text-right sm:pr-3">
                                  {isNumber(d.amount) && isNumber(price) && (
                                    <div className="flex items-center justify-end">
                                      <Number
                                        value={d.amount * price}
                                        prefix="$"
                                        noTooltip={true}
                                        className="text-xs font-medium"
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {delegations.length > delegationsSizePerPage && (
                    <TablePagination
                      data={delegations}
                      value={delegationsPage}
                      onChange={page => setDelegationsPage(page)}
                      sizePerPage={delegationsSizePerPage}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function Uptimes({ data }) {
  return (
    data && (
      <div className="my-2.5 flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-4 pr-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              Uptimes
            </h3>
            <p className="text-xs leading-5 text-zinc-400 dark:text-zinc-500">
              Latest {numberFormat(size, '0,0')} Blocks
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Number
              value={(data.filter(d => d.status).length * 100) / data.length}
              suffix="%"
              className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
            />
            <Number
              value={data.filter(d => d.status).length}
              format="0,0"
              suffix={`/${data.length}`}
              className="text-xs leading-5 text-zinc-400 dark:text-zinc-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap">
          {data.map((d, i) => (
            <Link
              key={i}
              href={`/block/${d.height}`}
              target="_blank"
              className="h-5 w-5"
            >
              <Tooltip content={numberFormat(d.height, '0,0')}>
                <div
                  className={clsx(
                    'm-0.5 h-4 w-4 rounded-sm',
                    d.status
                      ? 'bg-green-600 dark:bg-green-500'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  )}
                />
              </Tooltip>
            </Link>
          ))}
        </div>
      </div>
    )
  );
}

function ProposedBlocks({ data }) {
  return (
    data && (
      <div className="my-2.5 flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-4 pr-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              Proposed Blocks
            </h3>
            <p className="text-xs leading-5 text-zinc-400 dark:text-zinc-500">
              Latest {numberFormat(NUM_LATEST_PROPOSED_BLOCKS, '0,0')} Blocks
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Number
              value={(data.length * 100) / NUM_LATEST_PROPOSED_BLOCKS}
              suffix="%"
              className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
            />
            <Number
              value={data.length}
              format="0,0"
              suffix={`/${NUM_LATEST_PROPOSED_BLOCKS}`}
              className="text-xs leading-5 text-zinc-400 dark:text-zinc-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap">
          {data.map((d, i) => (
            <Link
              key={i}
              href={`/block/${d.height}`}
              target="_blank"
              className="h-5 w-5"
            >
              <Tooltip content={numberFormat(d.height, '0,0')}>
                <div
                  className={clsx(
                    'm-0.5 h-4 w-4 rounded-sm bg-green-600 dark:bg-green-500'
                  )}
                />
              </Tooltip>
            </Link>
          ))}
        </div>
      </div>
    )
  );
}

function Heartbeats({ data }) {
  return (
    data && (
      <div className="my-2.5 flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-4 pr-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              Heartbeats
            </h3>
            <p className="text-xs leading-5 text-zinc-400 dark:text-zinc-500">
              Latest {numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Number
              value={(data.filter(d => d.status).length * 100) / data.length}
              suffix="%"
              className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
            />
            <Number
              value={data.filter(d => d.status).length}
              format="0,0"
              suffix={`/${data.length}`}
              className="text-xs leading-5 text-zinc-400 dark:text-zinc-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap">
          {data.map((d, i) => (
            <Link
              key={i}
              href={
                d.txhash
                  ? `/tx/${d.txhash}`
                  : `/block/${d.height || d.period_height}`
              }
              target="_blank"
              className="h-5 w-5"
            >
              <Tooltip
                content={numberFormat(d.height || d.period_height, '0,0')}
              >
                <div
                  className={clsx(
                    'm-0.5 h-4 w-4 rounded-sm',
                    d.status
                      ? 'bg-green-600 dark:bg-green-500'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  )}
                />
              </Tooltip>
            </Link>
          ))}
        </div>
      </div>
    )
  );
}

function Votes({ data }) {
  const { chains } = useGlobalStore();

  const totalY = toArray(data).filter(
    d => typeof d.vote === 'boolean' && d.vote
  ).length;
  const totalN = toArray(data).filter(
    d => typeof d.vote === 'boolean' && !d.vote
  ).length;
  const totalUN = toArray(data).filter(d => typeof d.vote !== 'boolean').length;
  const totalVotes = Object.fromEntries(
    Object.entries({ Y: totalY, N: totalN, UN: totalUN }).filter(
      ([k, v]) => v || k === 'Y'
    )
  );

  return (
    data?.length > 0 && (
      <div className="my-2.5 flex flex-col gap-y-2">
        <div className="flex justify-between gap-x-4 pr-1">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              EVM Votes
            </h3>
            <p className="text-xs leading-5 text-zinc-400 dark:text-zinc-500">
              Latest {numberFormat(size, '0,0')} Polls (
              {numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks)
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Number
              value={
                (data.filter(d => typeof d.vote === 'boolean').length * 100) /
                data.length
              }
              suffix="%"
              className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100"
            />
            <Number
              value={data.length}
              format="0,0"
              prefix={`${Object.keys(totalVotes).length > 1 ? '(' : ''}${Object.entries(
                totalVotes
              )
                .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
                .join(' : ')}${Object.keys(totalVotes).length > 1 ? ')' : ''}/`}
              className="text-xs leading-5 text-zinc-400 dark:text-zinc-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap">
          {data.map((d, i) => {
            const { name } = { ...getChainData(d.sender_chain, chains) };

            return (
              <Link
                key={i}
                href={d.id ? `/evm-poll/${d.id}` : `/block/${d.height}`}
                target="_blank"
                className="h-5 w-5"
              >
                <Tooltip
                  content={
                    d.id
                      ? `Poll ID: ${d.id} (${name})`
                      : numberFormat(d.height, '0,0')
                  }
                  className="whitespace-nowrap"
                >
                  <div
                    className={clsx(
                      'm-0.5 h-4 w-4 rounded-sm',
                      typeof d.vote === 'boolean'
                        ? d.vote
                          ? 'bg-green-600 dark:bg-green-500'
                          : 'bg-red-600 dark:bg-red-500'
                        : 'bg-zinc-300 dark:bg-zinc-700'
                    )}
                  />
                </Tooltip>
              </Link>
            );
          })}
        </div>
      </div>
    )
  );
}

const size = 200;
const NUM_LATEST_BLOCKS = 10000;
const NUM_LATEST_PROPOSED_BLOCKS = 2500;
const NUM_BLOCKS_PER_HEARTBEAT = 50;

export function Validator({ address }) {
  const router = useRouter();
  const [EVMChains, setEVMChains] = useState(null);
  const [data, setData] = useState(null);
  const [delegations, setDelegations] = useState(null);
  const [uptimes, setUptimes] = useState(null);
  const [proposedBlocks, setProposedBlocks] = useState(null);
  const [heartbeats, setHeartbeats] = useState(null);
  const [votes, setVotes] = useState(null);
  const { chains, validators } = useGlobalStore();
  const { maintainers, setMaintainers } = useValidatorStore();

  // redirect or get evm chains
  useEffect(() => {
    if (address && validators) {
      if (
        ['axelarvalcons', 'axelar1'].findIndex(p => address.startsWith(p)) > -1
      ) {
        const { operator_address } = {
          ...validators.find(d =>
            includesSomePatterns(
              [d.consensus_address, d.delegator_address, d.broadcaster_address],
              address
            )
          ),
        };

        if (operator_address) {
          router.push(`/validator/${operator_address}`);
        }
      } else if (address.startsWith('axelarvaloper') && chains) {
        setEVMChains(
          chains.filter(d => d.chain_type === 'evm' && d.gateway?.address)
        );
      }
    }
  }, [address, router, setEVMChains, chains, validators]);

  // getChainMaintainers
  useEffect(() => {
    const getData = async () => {
      if (EVMChains) {
        setMaintainers(
          Object.fromEntries(
            await Promise.all(
              EVMChains.filter(d => !maintainers?.[d.id]).map(
                d =>
                  new Promise(async resolve => {
                    const { maintainers } = {
                      ...(await getChainMaintainers({ chain: d.id })),
                    };
                    resolve([d.id, toArray(maintainers)]);
                  })
              )
            )
          )
        );
      }
    };

    getData();
  }, [EVMChains, setMaintainers]);

  // set validator data
  useEffect(() => {
    const getData = async () => {
      if (
        address?.startsWith('axelarvaloper') &&
        EVMChains &&
        validators &&
        Object.keys({ ...maintainers }).length === EVMChains.length
      ) {
        const _data = validators.find(d =>
          equalsIgnoreCase(d.operator_address, address)
        );

        if (_data) {
          // broadcaster balance
          if (_data.broadcaster_address) {
            const { data } = {
              ...(await getBalances({ address: _data.broadcaster_address })),
            };
            _data.broadcasterBalance = toArray(data).find(
              d =>
                d.denom ===
                (ENVIRONMENT === 'devnet-amplifier' ? 'uamplifier' : 'uaxl')
            );
          }

          // support chains
          _data.supportedChains = Object.entries({ ...maintainers })
            .filter(([k, v]) => find(_data.operator_address, v))
            .map(([k, v]) => k);

          if (!_.isEqual(_data, data)) {
            setData(_data);
          }
        } else if (!data) {
          setData({
            status: 'errorOnGetData',
            code: 404,
            message: `Validator: ${address} not found`,
          });
        }
      }
    };

    getData();
  }, [address, EVMChains, data, setData, validators, maintainers]);

  // set validator metrics
  useEffect(() => {
    const getData = async () => {
      if (address && data && data.status !== 'error') {
        const { consensus_address, broadcaster_address } = { ...data };
        const { latest_block_height } = { ...(await getRPCStatus()) };

        if (latest_block_height) {
          await Promise.all(
            [
              'delegations',
              'uptimes',
              'proposedBlocks',
              'heartbeats',
              'votes',
            ].map(
              d =>
                new Promise(async resolve => {
                  switch (d) {
                    case 'delegations':
                      setDelegations(
                        (await getValidatorDelegations({ address }))?.data
                      );
                      break;
                    case 'uptimes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - size;

                        const { data } = {
                          ...(await searchUptimes({
                            fromBlock,
                            toBlock,
                            size,
                          })),
                        };

                        setUptimes(
                          _.range(0, size).map(i => {
                            const height = toBlock - i;
                            const d = toArray(data).find(
                              d => d.height === height
                            );

                            return {
                              ...d,
                              height,
                              status:
                                toArray(d?.validators).findIndex(a =>
                                  equalsIgnoreCase(a, consensus_address)
                                ) > -1,
                            };
                          })
                        );
                      } catch (error) {}
                      break;
                    case 'proposedBlocks':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - NUM_LATEST_PROPOSED_BLOCKS;

                        const { data } = {
                          ...(await searchProposedBlocks({
                            fromBlock,
                            toBlock,
                            size: NUM_LATEST_PROPOSED_BLOCKS,
                          })),
                        };

                        setProposedBlocks(
                          toArray(data).filter(d =>
                            equalsIgnoreCase(d.proposer, consensus_address)
                          )
                        );
                      } catch (error) {}
                      break;
                    case 'heartbeats':
                      const getEndBlock = (
                        height,
                        numBlocks = NUM_BLOCKS_PER_HEARTBEAT,
                        fraction = 1
                      ) => {
                        height = toNumber(height) + numBlocks;

                        while (height > 0 && height % numBlocks !== fraction) {
                          height--;
                        }

                        return height - 1;
                      };

                      const getStartBlock = height =>
                        getEndBlock(
                          toNumber(height) - NUM_BLOCKS_PER_HEARTBEAT
                        ) + 1;

                      try {
                        const fromBlock = getStartBlock(
                          latest_block_height - NUM_LATEST_BLOCKS
                        );
                        const toBlock = getEndBlock(latest_block_height);

                        const { data } = {
                          ...(await searchHeartbeats({
                            address: broadcaster_address,
                            fromBlock,
                            toBlock,
                            size,
                          })),
                        };

                        setHeartbeats(
                          _.range(0, size).map(i => {
                            const height = getStartBlock(
                              toBlock - i * NUM_BLOCKS_PER_HEARTBEAT
                            );
                            const d = toArray(data).find(
                              d => d.period_height === height
                            );

                            return {
                              ...d,
                              period_height: height,
                              status:
                                !!broadcaster_address &&
                                equalsIgnoreCase(
                                  d?.sender,
                                  broadcaster_address
                                ),
                            };
                          })
                        );
                      } catch (error) {}
                      break;
                    case 'votes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - NUM_LATEST_BLOCKS;

                        const { data } = {
                          ...(broadcaster_address &&
                            (await searchEVMPolls({
                              voter: broadcaster_address,
                              fromBlock,
                              toBlock,
                              size,
                            }))),
                        };

                        setVotes(
                          toArray(data).map(d =>
                            Object.fromEntries(
                              Object.entries(d)
                                // filter broadcaster address
                                .filter(
                                  ([k, v]) =>
                                    !k.startsWith('axelar1') ||
                                    equalsIgnoreCase(k, broadcaster_address)
                                )
                                // flatMap vote data
                                .flatMap(([k, v]) =>
                                  equalsIgnoreCase(k, broadcaster_address)
                                    ? Object.entries({ ...v }).map(([k, v]) => [
                                        k === 'id' ? 'txhash' : k,
                                        v,
                                      ])
                                    : [[k, v]]
                                )
                            )
                          )
                        );
                      } catch (error) {}
                      break;
                    default:
                      break;
                  }

                  resolve();
                })
            )
          );
        }
      }
    };

    getData();
  }, [address, data]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : data.status === 'errorOnGetData' ? (
        <Response data={data} />
      ) : (
        <div className="grid gap-y-4 md:grid-cols-3 md:gap-x-4 md:gap-y-0">
          <div className="md:col-span-2">
            <Info data={data} address={address} delegations={delegations} />
          </div>
          {!(uptimes || proposedBlocks || heartbeats || votes) ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-y-4">
              <Uptimes data={uptimes} />
              <ProposedBlocks data={proposedBlocks} />
              <Heartbeats data={heartbeats} />
              <Votes data={votes} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
