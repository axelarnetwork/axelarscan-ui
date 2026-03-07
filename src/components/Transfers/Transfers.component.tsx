'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import {
  MdOutlineRefresh,
  MdOutlineTimer,
} from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo, TimeSpent } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useAssets } from '@/hooks/useGlobalData';
import { searchTransfers } from '@/lib/api/token-transfer';
import { ENVIRONMENT, getAssetData } from '@/lib/config';
import { toCase } from '@/lib/parser';
import {
  getParams,
  generateKeyByParams,
} from '@/lib/operator';
import {
  isString,
  equalsIgnoreCase,
  toBoolean,
  ellipse,
  toTitle,
} from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

import { Filters } from './Filters.component';
import type { TransfersProps, TransferSearchResults } from './Transfers.types';
import * as styles from './Transfers.styles';

const size = 25;

export const normalizeType = (type: string | undefined) =>
  ['wrap', 'unwrap', 'erc20_transfer'].includes(type as string)
    ? 'deposit_service'
    : type || 'deposit_address';

export function Transfers({ address }: TransfersProps) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<TransferSearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | string | null>(null);
  const assets = useAssets();

  useEffect(() => {
    const _params = getParams(searchParams, size) as Record<string, unknown>;

    if (address) {
      _params.address = address;
    }

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [address, searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh)) return;

      const sort =
        params.sortBy === 'value' ? { 'send.value': 'desc' } : undefined;

      if (params.from === 0) {
        delete params.from;
      }

      const _params = _.cloneDeep(params);
      delete _params.sortBy;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await searchTransfers({ ..._params, size, sort }) as any;

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          ...(response?.total ||
          (Object.keys(_params).length > 0 &&
            !(
              Object.keys(_params).length === 1 && _params.from !== undefined
            )) ||
          ENVIRONMENT !== 'mainnet'
            ? response
            : searchResults?.[generateKeyByParams(params)]),
        },
      });
      setRefresh(
        !isNumber(response?.total) &&
          !searchResults?.[generateKeyByParams(params)] &&
          ENVIRONMENT === 'mainnet'
          ? true
          : false,
      );
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), 0.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, total } = { ...searchResults?.[generateKeyByParams(params as Record<string, unknown>)] } as any;

  return (
    <Container className={styles.transfersContainer}>
      <div
        role="alert"
        className={styles.deprecationBanner}
      >
        <PiWarningCircle size={20} aria-hidden="true" />
        <span className={styles.deprecationBannerText}>Legacy Token Transfers are deprecated.</span>
      </div>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.transfersHeaderRow}>
            <div className={styles.transfersHeaderLeft}>
              <h1 className={styles.transfersTitle}>
                Token Transfers
              </h1>
              <p className={styles.transfersSubtitle}>
                <Number
                  value={total}
                  suffix={` result${total > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.transfersActions}>
              {!address && <Filters />}
              {refresh && refresh !== 'true' ? (
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
          {refresh && refresh !== 'true' && <Overlay />}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadTr}>
                  <th
                    scope="col"
                    className={styles.thTxHash}
                  >
                    Tx Hash
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Method
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Source
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Destination
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Status
                  </th>
                  <th
                    scope="col"
                    className={styles.thCreatedAt}
                  >
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.map((d: any) => {
                  const assetData = getAssetData(d.send.denom, assets);

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const { addresses } = { ...assetData } as any;
                  let { symbol, image } = {
                    ...addresses?.[d.send.source_chain],
                  };

                  if (!symbol) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    symbol = (assetData as any)?.symbol;
                  }

                  if (!image) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    image = (assetData as any)?.image;
                  }

                  if (symbol) {
                    switch (d.type) {
                      case 'wrap':
                        const WRAP_PREFIXES = ['w', 'axl'];
                        const i = WRAP_PREFIXES.findIndex(
                          (p: string) =>
                            toCase(symbol, 'lower').startsWith(p) &&
                            !equalsIgnoreCase(p, symbol),
                        );

                        if (i > -1) {
                          symbol = symbol.substring(WRAP_PREFIXES[i].length);
                        }
                        break;
                      default:
                        break;
                    }
                  }

                  const senderAddress =
                    d.wrap?.sender_address ||
                    d.erc20_transfer?.sender_address ||
                    d.send?.sender_address;
                  const recipientAddress =
                    d.unwrap?.recipient_address || d.link?.recipient_address;

                  return (
                    <tr
                      key={d.send.txhash}
                      className={styles.tr}
                    >
                      <td className={styles.tdTxHash}>
                        <div className={styles.tdTxHashRow}>
                          <Copy value={d.send.txhash}>
                            <Link
                              href={`/transfer/${d.send.txhash}`}
                              target="_blank"
                              className={styles.tdTxHashLink}
                            >
                              {ellipse(d.send.txhash, 4, '0x')}
                            </Link>
                          </Copy>
                          <ExplorerLink
                            value={d.send.txhash}
                            chain={d.send.source_chain}
                          />
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.methodCol}>
                          <Tag className={clsx(styles.tagFitCapitalize)}>
                            {toTitle(normalizeType(d.type))}
                          </Tag>
                          {symbol && (
                            <div className={styles.assetBadge}>
                              <Image
                                src={image}
                                alt=""
                                width={16}
                                height={16}
                              />
                              {isNumber(d.send.amount) && assets ? (
                                <Number
                                  value={
                                    isString(d.send.amount)
                                      ? formatUnits(
                                          d.send.amount,
                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                          (assetData as any)?.decimals,
                                        )
                                      : d.send.amount
                                  }
                                  format="0,0.000000"
                                  suffix={` ${symbol}`}
                                  className={styles.assetNumberText}
                                />
                              ) : (
                                <span className={styles.assetSymbolText}>
                                  {symbol}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.chainCol}>
                          <ChainProfile
                            value={d.send.source_chain}
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={senderAddress}
                            chain={d.send.source_chain}
                          />
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.chainCol}>
                          <ChainProfile
                            value={
                              d.send.destination_chain ||
                              d.link?.destination_chain
                            }
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={recipientAddress}
                            chain={
                              d.send.destination_chain ||
                              d.link?.destination_chain
                            }
                          />
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.statusCol}>
                          {d.simplified_status && (
                            <div className={styles.statusRow}>
                              <Tag
                                className={clsx(
                                  styles.tagFitCapitalize,
                                  ['received'].includes(d.simplified_status)
                                    ? styles.statusTagReceived
                                    : ['approved'].includes(d.simplified_status)
                                      ? styles.statusTagApproved
                                      : ['failed'].includes(d.simplified_status)
                                        ? styles.statusTagFailed
                                        : styles.statusTagDefault,
                                )}
                              >
                                {d.simplified_status}
                              </Tag>
                              {['received'].includes(d.simplified_status) && (
                                <ExplorerLink
                                  value={
                                    d.unwrap?.tx_hash_unwrap ||
                                    d.command?.transactionHash ||
                                    d.axelar_transfer?.txhash ||
                                    d.ibc_send?.recv_txhash
                                  }
                                  chain={
                                    d.send.destination_chain ||
                                    d.link?.destination_chain
                                  }
                                />
                              )}
                            </div>
                          )}
                          {d.send.insufficient_fee && (
                            <div className={styles.insufficientFeeRow}>
                              <PiWarningCircle size={16} />
                              <span className={styles.insufficientFeeText}>Insufficient Fee</span>
                            </div>
                          )}
                          {d.time_spent?.total > 0 &&
                            ['received'].includes(d.simplified_status) && (
                              <div className={styles.timeSpentRow}>
                                <MdOutlineTimer size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={d.time_spent.total * 1000}
                                  className={styles.timeSpentText}
                                />
                              </div>
                            )}
                        </div>
                      </td>
                      <td className={styles.tdCreatedAt}>
                        <TimeAgo timestamp={d.send.created_at?.ms} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {total > size && (
            <div className={styles.paginationWrapper}>
              <Pagination sizePerPage={size} total={total} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
