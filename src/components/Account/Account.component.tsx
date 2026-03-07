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
import type { Validator } from '@/types';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
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
import * as styles from './Account.styles';

interface DepositAddressData {
  source_chain?: string;
  destination_chain?: string;
  denom?: string;
  sender_address?: string;
  recipient_address?: string;
}

interface TransferSend {
  source_chain?: string;
  destination_chain?: string;
  sender_address?: string;
  recipient_address?: string;
  txhash?: string;
}

interface TransferData {
  link?: DepositAddressData;
  send?: TransferSend;
}

interface AccountData {
  rewards?: { total?: { amount: number }[] };
  commissions?: { amount: number }[];
  delegations?: { data?: DelegationEntry[] };
  redelegations?: { data?: DelegationEntry[] };
  unbondings?: { data?: DelegationEntry[] };
  balances?: { data?: BalanceEntry[] };
  depositAddressData?: DepositAddressData;
  transferData?: TransferData;
  [key: string]: unknown;
}

interface BalanceEntry {
  denom?: string;
  amount: number;
  value?: number;
}

interface DelegationEntry {
  validator_address?: string;
  validator_src_address?: string;
  validator_dst_address?: string;
  amount?: number;
  completion_time?: string;
}

interface DepositAddressProps {
  data: AccountData;
  address: string;
}

function DepositAddress({ data, address }: DepositAddressProps) {
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
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Profile address={address} />
        </h3>
      </div>
      <div className={styles.cardBorder}>
        <dl className={styles.cardDivider}>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>
              Source
            </dt>
            <dd className={styles.detailValue}>
              <div className={styles.detailValueCol}>
                <ChainProfile value={sourceChain} />
                <Profile address={senderAddress} chain={sourceChain} />
              </div>
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>
              Destination
            </dt>
            <dd className={styles.detailValue}>
              <div className={styles.detailValueCol}>
                <ChainProfile value={destinationChain} />
                <Profile
                  address={destinationAddress}
                  chain={destinationChain}
                />
              </div>
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>
              Asset
            </dt>
            <dd className={styles.detailValue}>
              <AssetProfile value={denom} />
            </dd>
          </div>
          {txhash && (
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>
                Transfer
              </dt>
              <dd className={styles.detailValue}>
                <Copy value={txhash}>
                  <Link
                    href={`/transfer/${txhash}`}
                    target="_blank"
                    className={styles.transferLink}
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

interface InfoProps {
  data: AccountData;
  address: string;
}

function Info({ data, address }: InfoProps) {
  const chains = useChains();
  const validators = useValidators();

  const { rewards, commissions, delegations, redelegations, unbondings } = {
    ...data,
  };
  const { symbol } = { ...(getChainData('axelarnet', chains)?.native_token as Record<string, unknown>) };

  const validatorData = (toArray(validators) as Validator[]).find(d =>
    equalsIgnoreCase(d.delegator_address, address)
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Profile address={address} />
        </h3>
      </div>
      <div className={styles.cardBorder}>
        <dl className={styles.cardDivider}>
          {getInputType(address, chains!) === 'axelarAddress' && (
            <>
              {rewards?.total?.[0] && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>
                    Rewards
                  </dt>
                  <dd className={styles.detailValue}>
                    <div className={styles.detailValueRow}>
                      <Number
                        value={rewards.total[0].amount}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className={styles.numberValue}
                      />
                    </div>
                  </dd>
                </div>
              )}
              {validatorData && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>
                    Commissions
                  </dt>
                  <dd className={styles.detailValue}>
                    <div className={styles.detailValueRow}>
                      {commissions?.[0] && (
                        <Number
                          value={commissions[0].amount}
                          format="0,0.000000"
                          suffix={` ${symbol}`}
                          className={styles.numberValue}
                        />
                      )}
                    </div>
                  </dd>
                </div>
              )}
              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>
                  Delegations
                </dt>
                <dd className={styles.detailValue}>
                  <div className={styles.detailValueRow}>
                    {delegations?.data && (
                      <Number
                        value={_.sumBy(delegations.data, 'amount')}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className={styles.numberValue}
                      />
                    )}
                  </div>
                </dd>
              </div>
              {redelegations?.data && (
                <div className={styles.detailRow}>
                  <dt className={styles.detailLabel}>
                    Redelegations
                  </dt>
                  <dd className={styles.detailValue}>
                    <div className={styles.detailValueRow}>
                      <Number
                        value={_.sumBy(redelegations.data, 'amount')}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className={styles.numberValue}
                      />
                    </div>
                  </dd>
                </div>
              )}
              <div className={styles.detailRow}>
                <dt className={styles.detailLabel}>
                  Unstakings
                </dt>
                <dd className={styles.detailValue}>
                  <div className={styles.detailValueRow}>
                    {unbondings?.data && (
                      <Number
                        value={_.sumBy(unbondings.data, 'amount')}
                        format="0,0.000000"
                        suffix={` ${symbol}`}
                        className={styles.numberValue}
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

interface BalancesProps {
  data: BalanceEntry[] | undefined;
}

function Balances({ data }: BalancesProps) {
  const [page, setPage] = useState(1);
  const assets = useAssets();

  return (
    data && (
      <div className={styles.balancesContainer}>
        <div className={styles.tableScrollContainer}>
          <h3 className={styles.sectionTitle}>Balances</h3>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.thFirst}>
                  #
                </th>
                <th scope="col" className={styles.thDefault}>
                  Asset
                </th>
                <th scope="col" className={styles.thRight}>
                  Balance
                </th>
                <th scope="col" className={styles.thLast}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {data
                .filter(
                  (_d: BalanceEntry, i: number) =>
                    i >= (page - 1) * sizePerPage && i < page * sizePerPage
                )
                .map((d: BalanceEntry, i: number) => {
                  const burnedPrefix = 'burned-';

                  const { symbol, image, price } = {
                    ...getAssetData(d.denom?.replace(burnedPrefix, ''), assets),
                  };
                  const isBurned = d.denom?.startsWith(burnedPrefix);

                  return (
                    <tr
                      key={i}
                      className={styles.tableRow}
                    >
                      <td className={styles.tdIndex}>
                        {(page - 1) * sizePerPage + i + 1}
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.assetCell}>
                          <Image src={image} alt="" width={16} height={16} />
                          {(symbol || d.denom) && (
                            <div className={styles.assetInfo}>
                              <div className={styles.assetNameWrapper}>
                                <span className={styles.assetName}>
                                  {isBurned ? 'Burned ' : ''}
                                  {ellipse(symbol || d.denom, 6, 'ibc/')}
                                </span>
                                {!symbol && <Copy size={16} value={d.denom} />}
                              </div>
                              {price! > 0 && (
                                <Number
                                  value={price!}
                                  maxDecimals={2}
                                  prefix="$"
                                  className={styles.assetPrice}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.cellEndAligned}>
                          <Number
                            value={d.amount}
                            className={styles.balanceValue}
                          />
                        </div>
                      </td>
                      <td className={styles.tdLast}>
                        <div className={styles.cellEndAligned}>
                          {price! > 0 && (
                            <Number
                              value={d.amount * price!}
                              prefix="$"
                              noTooltip={true}
                              className={styles.balanceUsdValue}
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
          <div className={styles.paginationWrapper}>
            <TablePagination
              data={data}
              value={page}
              onChange={(p: number) => setPage(p)}
              sizePerPage={sizePerPage}
            />
          </div>
        )}
      </div>
    )
  );
}

interface DelegationsProps {
  data: AccountData;
}

function Delegations({ data }: DelegationsProps) {
  const TABS = ['delegations', 'redelegations', 'unstakings'] as const;

  const [tab, setTab] = useState<string>(TABS[0]);
  const [page, setPage] = useState(1);
  const _assets = useAssets();

  const { delegations, redelegations, unbondings } = { ...data };

  let selectedData: DelegationEntry[] | undefined;

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
      <div className={styles.balancesContainer}>
        <div className={styles.tableScrollContainer}>
          <nav className={styles.tabNav}>
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
                  type === tab
                    ? styles.tabActive
                    : styles.tabInactive
                )}
              >
                {type}
              </button>
            ))}
          </nav>
          <table className={styles.table}>
            <thead className={styles.tableHeadDelegations}>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.thFirst}>
                  #
                </th>
                <th scope="col" className={styles.thDefault}>
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
                    className={styles.thUnstakingsAvailable}
                  >
                    Available at
                  </th>
                )}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {(toArray(selectedData) as DelegationEntry[])
                .filter(
                  (_d, i) =>
                    i >= (page - 1) * sizePerPage && i < page * sizePerPage
                )
                .map((d, i) => (
                  <tr
                    key={i}
                    className={styles.tableRow}
                  >
                    <td className={styles.tdIndex}>
                      {(page - 1) * sizePerPage + i + 1}
                    </td>
                    <td className={styles.tdDefault}>
                      <div className={styles.delegationValidatorCell}>
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
                              className={styles.redelegationArrow}
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
                      <div className={styles.cellEndAligned}>
                        <Number
                          value={d.amount}
                          className={styles.balanceValue}
                        />
                      </div>
                    </td>
                    {tab === 'unstakings' && (
                      <td className={styles.tdUnstakingsTime}>
                        <TimeAgo
                          timestamp={d.completion_time}
                          className="text-xs"
                        />
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {(selectedData?.length ?? 0) > sizePerPage && (
          <div className={styles.paginationWrapper}>
            <TablePagination
              data={selectedData!}
              value={page}
              onChange={(p: number) => setPage(p)}
              sizePerPage={sizePerPage}
            />
          </div>
        )}
      </div>
    )
  );
}

interface AccountProps {
  address: string;
}

export function Account({ address }: AccountProps) {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

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
                d.consensus_address ?? '',
              ])
            ),
          };
          router.push(`/validator/${operator_address}`);
        } else if (chains && assets) {
          const isEVMAddress = getInputType(address, chains) === 'evmAddress';
          const accountData = (isEVMAddress ? {} : await getAccountAmounts({ address })) as AccountData;

          if (accountData) {
            if (accountData.balances?.data) {
              accountData.balances.data = _.orderBy(
                accountData.balances.data.map((d: BalanceEntry) => ({
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
                await searchDepositAddresses({ address }) as { data?: DepositAddressData[] } | undefined
              )?.data?.[0];

              if (depositAddressData) {
                accountData.depositAddressData = depositAddressData;

                const transferData = (
                  await searchTransfers({ depositAddress: address }) as { data?: TransferData[] } | undefined
                )?.data?.[0];

                if (transferData) {
                  accountData.transferData = transferData;
                }
              }
            }

            console.log('[data]', accountData);
            setData(accountData);
          }
        }
      }
    };

    getData();
  }, [address, router, setData, chains, assets, validators]);

  if (!address) return null;

  const isDepositAddress =
    ((address.length >= 65 || getInputType(address, chains!) === 'evmAddress') &&
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
        <div className={styles.mainGrid}>
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
          <div className={styles.transactionsCol}>
            <Transactions address={address} />
          </div>
        </div>
      )}
    </Container>
  );
}
