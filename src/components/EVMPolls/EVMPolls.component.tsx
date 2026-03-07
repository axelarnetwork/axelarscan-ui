'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getChainData, getAssetData } from '@/lib/config';
import {
  toJson,
  toArray,
} from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import {
  ellipse,
  toBoolean,
} from '@/lib/string';
import { formatUnits, numberFormat } from '@/lib/number';
import { timeDiff } from '@/lib/time';

import type { Validator } from '@/types';

import { Filters } from './Filters.component';
import type {
  VoteOption,
  ConfirmationEvent,
  EVMPollRecord,
  ProcessedPoll,
  AssetJson,
  SearchResults,
} from './EVMPolls.types';
import * as styles from './EVMPolls.styles';
import { buildVoteSuffix, processPolls } from './EVMPolls.utils';

const size = 25;

export function EVMPolls() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh)) return;

      const response = await searchEVMPolls({ ...params, size }) as Record<string, unknown> | null;
      const { data: rawData, total } = { ...response } as { data?: unknown; total?: number };

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: _.orderBy(
            processPolls(rawData as EVMPollRecord[], chains),
            ['idNumber', 'created_at.ms'],
            ['desc', 'desc']
          ),
          total: total || 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, chains]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params ?? {})] };

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
              <h1 className={styles.pageTitle}>
                EVM Polls
              </h1>
              <span className={styles.titleSeparator}>|</span>
              <Link
                href="/amplifier-polls"
                className={styles.amplifierLink}
              >
                Amplifier Polls
              </Link>
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
                <th
                  scope="col"
                  className={styles.thFirst}
                >
                  ID
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Chain
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Event
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
                <th
                  scope="col"
                  className={styles.thLast}
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d: ProcessedPoll) => {
                const chainData = getChainData(d.sender_chain, chains);
                const chain = chainData?.id;
                const { url, transaction_path } = { ...chainData?.explorer };

                const totalParticipantsPower = _.sumBy(
                  toArray(validators).filter(
                    (val: Validator) =>
                      true ||
                      toArray(d.participants).includes(val.operator_address)
                  ),
                  'quadratic_voting_power'
                );

                const eventElement = (
                  <Tag className={clsx(styles.eventTagBase)}>{d.eventName}</Tag>
                );

                return (
                  <tr
                    key={d.id}
                    className={styles.tr}
                  >
                    <td className={styles.tdFirst}>
                      <div className={styles.pollIdWrapper}>
                        <Copy value={d.id}>
                          <Link
                            href={`/evm-poll/${d.id}`}
                            target="_blank"
                            className={styles.pollLink}
                          >
                            {ellipse(d.id)}
                          </Link>
                        </Copy>
                        {d.transaction_id && (
                          <div className={styles.txIdRow}>
                            <Copy value={d.transaction_id}>
                              <Link
                                href={`${url}${transaction_path?.replace('{tx}', d.transaction_id)}`}
                                target="_blank"
                                className={styles.pollLink}
                              >
                                {ellipse(d.transaction_id)}
                              </Link>
                            </Copy>
                            <ExplorerLink
                              value={d.transaction_id}
                              chain={d.sender_chain}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.tdMiddle}>
                      <ChainProfile value={d.sender_chain} />
                    </td>
                    <td className={styles.tdMiddle}>
                      <div className={styles.eventWrapper}>
                        {d.eventName &&
                          (d.url ? (
                            <Link href={d.url} target="_blank">
                              {eventElement}
                            </Link>
                          ) : (
                            eventElement
                          ))}
                        {toArray(d.confirmation_events).map((e: ConfirmationEvent, i: number) => {
                          let { asset, symbol, amount } = { ...e };

                          // asset is object { denom, amount }
                          const assetObj = toJson<AssetJson>(asset);

                          if (assetObj) {
                            asset = assetObj.denom;
                            amount = assetObj.amount;
                          }

                          // asset data
                          const assetData = getAssetData(
                            asset || symbol,
                            assets
                          );
                          const { decimals, addresses } = { ...assetData };
                          let { image } = { ...assetData };

                          if (assetData) {
                            const chainAddresses = chain ? addresses?.[chain] : undefined;
                            symbol =
                              chainAddresses?.symbol ||
                              assetData.symbol ||
                              symbol;
                            image = image =
                              chainAddresses?.image || image;
                          }

                          const element = symbol && (
                            <div className={styles.assetPill}>
                              <Image
                                src={image}
                                alt=""
                                width={16}
                                height={16}
                              />
                              {amount && assets ? (
                                <Number
                                  value={formatUnits(String(amount), decimals)}
                                  format="0,0.000000"
                                  suffix={` ${symbol}`}
                                  className={styles.assetText}
                                />
                              ) : (
                                <span className={styles.assetText}>
                                  {symbol}
                                </span>
                              )}
                            </div>
                          );

                          return (
                            element &&
                            (d.url ? (
                              <Link key={i} href={d.url} target="_blank">
                                {element}
                              </Link>
                            ) : (
                              <div key={i}>{element}</div>
                            ))
                          );
                        })}
                      </div>
                    </td>
                    <td className={styles.tdMiddle}>
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
                    <td className={styles.tdMiddle}>
                      <div className={styles.statusWrapper}>
                        {d.status && (
                          <Tag
                            className={clsx(
                              styles.statusTagBase,
                              styles.getStatusTagStyle(d.status)
                            )}
                          >
                            {d.status}
                          </Tag>
                        )}
                        <div className={styles.statusLinksWrapper}>
                          {d.initiated_txhash && (
                            <Link
                              href={`/tx/${d.initiated_txhash}`}
                              target="_blank"
                              className={styles.statusLinkRow}
                            >
                              <IoCheckmarkCircle
                                size={18}
                                className={styles.statusIconGreen}
                              />
                              <span className={styles.statusLabelMuted}>
                                Initiated
                              </span>
                            </Link>
                          )}
                          {d.confirmation_txhash && (
                            <Link
                              href={`/tx/${d.confirmation_txhash}`}
                              target="_blank"
                              className={styles.statusLinkRow}
                            >
                              <IoCheckmarkDoneCircle
                                size={18}
                                className={styles.statusIconGreen}
                              />
                              <span className={styles.statusLabelGreen}>
                                Confirmation
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.tdMiddle}>
                      <Link
                        href={`/evm-poll/${d.id}`}
                        target="_blank"
                        className={styles.participationLink}
                      >
                        {d.voteOptions.map((v: VoteOption, i: number) => {
                          const totalVotersPower = _.sumBy(
                            toArray(validators).filter((val: Validator) =>
                              val.broadcaster_address != null &&
                              toArray(v.voters).includes(
                                val.broadcaster_address
                              )
                            ),
                            'quadratic_voting_power'
                          );

                          const powerDisplay =
                            totalVotersPower > 0 && totalParticipantsPower > 0
                              ? `${numberFormat(totalVotersPower, '0,0.0a')} (${numberFormat((totalVotersPower * 100) / totalParticipantsPower, '0,0.0')}%)`
                              : '';
                          const isDisplayPower =
                            !!powerDisplay &&
                            timeDiff(d.created_at?.ms, 'days') < 3;

                          return (
                            <Number
                              key={i}
                              value={v.value}
                              format="0,0"
                              suffix={buildVoteSuffix(v.option, powerDisplay, isDisplayPower)}
                              noTooltip={true}
                              className={clsx(
                                styles.voteOptionBase,
                                styles.getVoteOptionStyle(v.option)
                              )}
                            />
                          );
                        })}
                      </Link>
                    </td>
                    <td className={styles.tdLast}>
                      <TimeAgo timestamp={d.created_at?.ms} />
                    </td>
                  </tr>
                );
              })}
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
