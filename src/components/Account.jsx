'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdArrowForwardIos } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { TablePagination } from '@/components/Pagination';
import { Transactions } from '@/components/Transactions';
import { useGlobalStore } from '@/components/Global';
import { getAccountAmounts } from '@/lib/api/axelarscan';
import {
  searchTransfers,
  searchDepositAddresses,
} from '@/lib/api/token-transfer';
import {
  axelarContracts,
  getAxelarContractAddresses,
  getChainData,
  getAssetData,
} from '@/lib/config';
import { getInputType, toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  find,
  includesSomePatterns,
  ellipse,
} from '@/lib/string';

function DepositAddress({ data, address }) {
  const { depositAddressData, transferData } = { ...data };

  const {
    source_chain,
    destination_chain,
    denom,
    sender_address,
    recipient_address,
  } = { ...(transferData?.link || depositAddressData) };
  const { txhash } = { ...transferData?.send };

  const sourceChain = transferData?.send?.source_chain || source_chain;
  const destinationChain =
    transferData?.send?.destination_chain || destination_chain;
  const senderAddress = transferData?.send?.sender_address || sender_address;
  const destinationAddress =
    transferData?.send?.recipient_address || recipient_address;

  return (
    <div className="h-fit overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
          <Profile address={address} />
        </h3>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Source
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              <div className="flex flex-col">
                <ChainProfile value={sourceChain} />
                <Profile address={senderAddress} chain={sourceChain} />
              </div>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Destination
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              <div className="flex flex-col">
                <ChainProfile value={destinationChain} />
                <Profile
                  address={destinationAddress}
                  chain={destinationChain}
                />
              </div>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Asset
            </dt>
            <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
              <AssetProfile value={denom} />
            </dd>
          </div>
          {txhash && (
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Transfer
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                <Copy value={txhash}>
                  <Link
                    href={`/transfer/${txhash}`}
                    target="_blank"
                    className="font-medium text-blue-600 dark:text-blue-500"
                  >
                    {ellipse(txhash)}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function Info({ data, address }) {
  const { chains, validators } = useGlobalStore();

  const { rewards, commissions, delegations, redelegations, unbondings } = {
    ...data,
  };
  const { symbol } = { ...getChainData('axelarnet', chains)?.native_token };

  const validatorData = toArray(validators).find(d =>
    equalsIgnoreCase(d.delegator_address, address)
  );

  return (
    <div className="h-fit overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <h3 className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100">
          <Profile address={address} />
        </h3>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {getInputType(address, chains) === 'axelarAddress' && (
            <>
              {rewards?.total?.[0] && (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Rewards
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center">
                      <Number
                        value={rewards.total[0].amount}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className="font-medium text-zinc-700 dark:text-zinc-300"
                      />
                    </div>
                  </dd>
                </div>
              )}
              {validatorData && (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Commissions
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center">
                      {commissions?.[0] && (
                        <Number
                          value={commissions[0].amount}
                          format="0,0.000000"
                          suffix={` ${symbol}`}
                          className="font-medium text-zinc-700 dark:text-zinc-300"
                        />
                      )}
                    </div>
                  </dd>
                </div>
              )}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Delegations
                </dt>
                <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center">
                    {delegations?.data && (
                      <Number
                        value={_.sumBy(delegations.data, 'amount')}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className="font-medium text-zinc-700 dark:text-zinc-300"
                      />
                    )}
                  </div>
                </dd>
              </div>
              {redelegations?.data && (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Redelegations
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                    <div className="flex items-center">
                      <Number
                        value={_.sumBy(redelegations.data, 'amount')}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className="font-medium text-zinc-700 dark:text-zinc-300"
                      />
                    </div>
                  </dd>
                </div>
              )}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Unstakings
                </dt>
                <dd className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center">
                    {unbondings?.data && (
                      <Number
                        value={_.sumBy(unbondings.data, 'amount')}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className="font-medium text-zinc-700 dark:text-zinc-300"
                      />
                    )}
                  </div>
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}

const sizePerPage = 10;

function Balances({ data }) {
  const [page, setPage] = useState(1);
  const { assets } = useGlobalStore();

  return (
    data && (
      <div className="flex flex-col bg-zinc-50/75 px-4 pb-6 pt-3 shadow dark:bg-zinc-800/25 sm:rounded-lg sm:px-6">
        <div className="-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
          <h3 className="text-sm font-semibold">Balances</h3>
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="sticky top-0 z-10">
              <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <th scope="col" className="py-2 pl-4 pr-3 text-left sm:pl-0">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Asset
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Balance
                </th>
                <th scope="col" className="py-2 pl-3 pr-4 text-right sm:pr-0">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data
                .filter(
                  (d, i) =>
                    i >= (page - 1) * sizePerPage && i < page * sizePerPage
                )
                .map((d, i) => {
                  const burnedPrefix = 'burned-';

                  const { symbol, image, price } = {
                    ...getAssetData(d.denom?.replace(burnedPrefix, ''), assets),
                  };
                  const isBurned = d.denom?.startsWith(burnedPrefix);

                  return (
                    <tr
                      key={i}
                      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                    >
                      <td className="py-4 pl-4 pr-3 text-left text-xs sm:pl-0">
                        {(page - 1) * sizePerPage + i + 1}
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex w-fit items-center gap-x-2">
                          <Image src={image} alt="" width={16} height={16} />
                          {(symbol || d.denom) && (
                            <div className="flex items-center gap-x-2">
                              <div className="flex items-center gap-x-1">
                                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                  {isBurned ? 'Burned ' : ''}
                                  {ellipse(symbol || d.denom, 6, 'ibc/')}
                                </span>
                                {!symbol && <Copy size={16} value={d.denom} />}
                              </div>
                              {price > 0 && (
                                <Number
                                  value={price}
                                  maxDecimals={2}
                                  prefix="$"
                                  className="text-xs text-zinc-400 dark:text-zinc-500"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <Number
                            value={d.amount}
                            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                      </td>
                      <td className="py-4 pl-3 pr-4 text-right sm:pr-0">
                        <div className="flex items-center justify-end">
                          {price > 0 && (
                            <Number
                              value={d.amount * price}
                              prefix="$"
                              noTooltip={true}
                              className="text-xs font-medium"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {data.length > sizePerPage && (
          <div className="mt-4 flex items-center justify-center">
            <TablePagination
              data={data}
              value={page}
              onChange={page => setPage(page)}
              sizePerPage={sizePerPage}
            />
          </div>
        )}
      </div>
    )
  );
}

function Delegations({ data }) {
  const TABS = ['delegations', 'redelegations', 'unstakings'];

  const [tab, setTab] = useState(TABS[0]);
  const [page, setPage] = useState(1);
  const { assets } = useGlobalStore();

  const { delegations, redelegations, unbondings } = { ...data };

  let selectedData;

  switch (tab) {
    case 'delegations':
      selectedData = delegations?.data;
      break;
    case 'redelegations':
      selectedData = redelegations?.data;
      break;
    case 'unstakings':
      selectedData = unbondings?.data;
      break;
    default:
      break;
  }

  return (
    toArray(_.concat(delegations?.data, redelegations?.data, unbondings?.data))
      .length > 0 && (
      <div className="flex flex-col bg-zinc-50/75 px-4 pb-6 pt-3 shadow dark:bg-zinc-800/25 sm:rounded-lg sm:px-6">
        <div className="-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
          <nav className="flex gap-x-4">
            {TABS.filter(type => {
              switch (type) {
                case 'delegations':
                  return toArray(delegations?.data).length > 0;
                case 'redelegations':
                  return toArray(redelegations?.data).length > 0;
                case 'unstakings':
                  return toArray(unbondings?.data).length > 0;
                default:
                  return true;
              }
            }).map((type, i) => (
              <button
                key={i}
                onClick={() => {
                  setTab(type);
                  setPage(1);
                }}
                className={clsx(
                  'text-sm capitalize',
                  type === tab
                    ? 'font-semibold text-zinc-900 underline dark:text-zinc-100'
                    : 'font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                )}
              >
                {type}
              </button>
            ))}
          </nav>
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="sticky top-0 z-10 bg-zinc-50/75 dark:bg-zinc-800/25">
              <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <th scope="col" className="py-2 pl-4 pr-3 text-left sm:pl-0">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Validator
                </th>
                <th
                  scope="col"
                  className={clsx(
                    'text-right',
                    tab === 'unstakings'
                      ? 'px-3 py-2'
                      : 'py-2 pl-3 pr-4 sm:pr-0'
                  )}
                >
                  Amount
                </th>
                {tab === 'unstakings' && (
                  <th
                    scope="col"
                    className="whitespace-nowrap py-2 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Available at
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {toArray(selectedData)
                .filter(
                  (d, i) =>
                    i >= (page - 1) * sizePerPage && i < page * sizePerPage
                )
                .map((d, i) => {
                  const { symbol, image, price } = {
                    ...getAssetData(d.denom, assets),
                  };

                  return (
                    <tr
                      key={i}
                      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                    >
                      <td className="py-4 pl-4 pr-3 text-left text-xs sm:pl-0">
                        {(page - 1) * sizePerPage + i + 1}
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex items-center gap-x-1.5">
                          <Profile
                            i={i}
                            address={
                              tab === 'redelegations'
                                ? d.validator_src_address
                                : d.validator_address
                            }
                            width={16}
                            height={16}
                            className="text-xs"
                          />
                          {tab === 'redelegations' && (
                            <>
                              <MdArrowForwardIos
                                size={12}
                                className="text-zinc-700 dark:text-zinc-300"
                              />
                              <Profile
                                i={i}
                                address={d.validator_dst_address}
                                width={16}
                                height={16}
                                className="text-xs"
                              />
                            </>
                          )}
                        </div>
                      </td>
                      <td
                        className={clsx(
                          'text-right',
                          tab === 'unstakings'
                            ? 'px-3 py-4'
                            : 'py-4 pl-3 pr-4 sm:pr-0'
                        )}
                      >
                        <div className="flex items-center justify-end">
                          <Number
                            value={d.amount}
                            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                          />
                        </div>
                      </td>
                      {tab === 'unstakings' && (
                        <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                          <TimeAgo
                            timestamp={d.completion_time}
                            className="text-xs"
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {selectedData?.length > sizePerPage && (
          <div className="mt-4 flex items-center justify-center">
            <TablePagination
              data={selectedData}
              value={page}
              onChange={page => setPage(page)}
              sizePerPage={sizePerPage}
            />
          </div>
        )}
      </div>
    )
  );
}

export function Account({ address }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const { chains, assets, validators } = useGlobalStore();

  useEffect(() => {
    const getData = async () => {
      if (address) {
        if (
          includesSomePatterns(address, ['axelarvaloper', 'axelarvalcons']) &&
          validators
        ) {
          const { operator_address } = {
            ...validators.find(d =>
              includesSomePatterns(address, [
                d.operator_address,
                d.consensus_address,
              ])
            ),
          };
          router.push(`/validator/${operator_address}`);
        } else if (chains && assets) {
          const isEVMAddress = getInputType(address, chains) === 'evmAddress';
          const data = isEVMAddress ? {} : await getAccountAmounts({ address });

          if (data) {
            if (data.balances?.data) {
              data.balances.data = _.orderBy(
                data.balances.data.map(d => ({
                  ...d,
                  value: d.amount * (getAssetData(d.denom, assets)?.price || 0),
                })),
                ['value'],
                ['desc']
              );
            }

            if (
              (address.length >= 65 || isEVMAddress) &&
              !find(
                address,
                _.concat(axelarContracts, getAxelarContractAddresses(chains))
              )
            ) {
              const depositAddressData = (
                await searchDepositAddresses({ address })
              )?.data?.[0];

              if (depositAddressData) {
                data.depositAddressData = depositAddressData;

                const transferData = (
                  await searchTransfers({ depositAddress: address })
                )?.data?.[0];

                if (transferData) {
                  data.transferData = transferData;
                }
              }
            }

            console.log('[data]', data);
            setData(data);
          }
        }
      }
    };

    getData();
  }, [address, router, setData, chains, assets, validators]);

  if (!address) return;

  const isDepositAddress =
    ((address.length >= 65 || getInputType(address, chains) === 'evmAddress') &&
      !find(
        address,
        _.concat(axelarContracts, getAxelarContractAddresses(chains))
      )) ||
    data?.depositAddressData;

  return (
    <Container className={clsx('sm:mt-8', data ? 'max-w-full' : '')}>
      {!data ? (
        <Spinner />
      ) : (
        <div className="grid gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12">
          {isDepositAddress && <DepositAddress data={data} address={address} />}
          {address.startsWith('axelar1') && (
            <>
              {!isDepositAddress && !(address.length >= 65) && (
                <Info data={data} address={address} />
              )}
              {(isDepositAddress ||
                find(
                  address,
                  _.concat(axelarContracts, getAxelarContractAddresses(chains))
                ) ||
                address.length < 65) && <Balances data={data.balances?.data} />}
              {!isDepositAddress && !(address.length >= 65) && (
                <Delegations data={data} />
              )}
            </>
          )}
          <div className="overflow-x-auto sm:col-span-3">
            <Transactions address={address} />
          </div>
        </div>
      )}
    </Container>
  );
}
