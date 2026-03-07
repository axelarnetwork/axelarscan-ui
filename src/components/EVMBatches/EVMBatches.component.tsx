'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineCode, MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile, ChainProfile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchBatches } from '@/lib/api/token-transfer';
import { ENVIRONMENT, getChainData, getAssetData } from '@/lib/config';
import { toCase, split, toArray } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean, ellipse } from '@/lib/string';
import { toNumber, formatUnits } from '@/lib/number';

import type { ChainExplorer } from '@/types';

import type { BatchCommand, BatchRecord, BatchSearchResponse, SearchResultsMap } from './EVMBatches.types';
import { PAGE_SIZE } from './EVMBatches.types';
import { Filters } from './Filters.component';
import * as styles from './EVMBatches.styles';

const NUM_COMMANDS_TRUNCATE = 10;

export function EVMBatches() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultsMap | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const chains = useChains();
  const assets = useAssets();

  useEffect(() => {
    const _params = getParams(searchParams, PAGE_SIZE);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh)) return;

      let response = await searchBatches({ ...params, size: PAGE_SIZE }) as BatchSearchResponse | null;

      if (
        response &&
        !response.data &&
        !['mainnet', 'testnet'].includes(ENVIRONMENT!)
      ) {
        response = { data: [], total: 0 };
      }

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: { ...response },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params!)] };

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
                EVM Batches
              </h1>
              <span className={styles.titleSeparator}>|</span>
              <Link
                href="/amplifier-proofs"
                className={styles.amplifierLink}
              >
                Amplifier Proofs
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
                  Commands
                </th>
                <th scope="col" className={styles.thRight}>
                  Status
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
              {data.map((d: BatchRecord) => {
                const { url, transaction_path } = {
                  ...getChainData(d.chain, chains)?.explorer,
                } as Partial<ChainExplorer>;

                const executed =
                  toArray(d.commands).length ===
                  toArray(d.commands).filter((c: BatchCommand) => c.executed).length;
                const status = executed
                  ? 'executed'
                  : toCase(
                      d.status?.replace('BATCHED_COMMANDS_STATUS_', ''),
                      'lower'
                    );

                return (
                  <tr
                    key={d.batch_id}
                    className={styles.tr}
                  >
                    <td className={styles.tdFirst}>
                      <div className={styles.batchIdWrapper}>
                        <Copy value={d.batch_id}>
                          <Link
                            href={`/evm-batch/${d.chain}/${d.batch_id}`}
                            target="_blank"
                            className={styles.batchLink}
                          >
                            {ellipse(d.batch_id)}
                          </Link>
                        </Copy>
                        <Copy value={d.key_id}>
                          <span>{d.key_id}</span>
                        </Copy>
                      </div>
                    </td>
                    <td className={styles.tdMiddle}>
                      <ChainProfile value={d.chain} />
                    </td>
                    <td className={styles.tdMiddle}>
                      <div className={styles.commandsWrapper}>
                        {_.slice(
                          toArray(d.commands),
                          0,
                          NUM_COMMANDS_TRUNCATE
                        ).map((c: BatchCommand, i: number) => {
                          const { type, deposit_address } = { ...c };
                          const {
                            amount,
                            name,
                            cap,
                            account,
                            salt,
                            newOwners,
                            newOperators,
                            newWeights,
                            newThreshold,
                            sourceChain,
                            sourceTxHash,
                            contractAddress,
                          } = { ...c.params };
                          let { symbol, decimals } = { ...c.params };

                          const transferID = parseInt(c.id, 16);
                          const assetData = getAssetData(symbol, assets);

                          symbol =
                            assetData?.addresses?.[d.chain]?.symbol ||
                            assetData?.symbol ||
                            symbol;
                          decimals =
                            assetData?.addresses?.[d.chain]?.decimals ||
                            assetData?.decimals ||
                            decimals ||
                            18;
                          const image =
                            assetData?.addresses?.[d.chain]?.image ||
                            assetData?.image;

                          const sourceChainData = getChainData(
                            sourceChain,
                            chains
                          );
                          const destinationChainData = getChainData(
                            d.chain,
                            chains
                          );

                          const typeElement = (
                            <Tooltip
                              content={c.executed ? 'Executed' : 'Unexecuted'}
                            >
                              <Tag
                                className={clsx(
                                  styles.commandTypeTagBase,
                                  c.executed
                                    ? styles.commandTypeTagExecuted
                                    : styles.commandTypeTagUnexecuted
                                )}
                              >
                                {type}
                              </Tag>
                            </Tooltip>
                          );

                          return (
                            <div
                              key={i}
                              className={styles.commandRow}
                            >
                              {url && c.transactionHash ? (
                                <Link
                                  href={`${url}${transaction_path?.replace('{tx}', c.transactionHash)}`}
                                  target="_blank"
                                >
                                  {typeElement}
                                </Link>
                              ) : (
                                typeElement
                              )}
                              {symbol &&
                                !['approveContractCall'].includes(type) && (
                                  <div className={styles.assetPill}>
                                    <Image
                                      src={image}
                                      alt=""
                                      width={16}
                                      height={16}
                                    />
                                    {amount && assets ? (
                                      <Number
                                        value={formatUnits(amount, decimals)}
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
                                )}
                              {sourceChainData && (
                                <div className={styles.sourceChainRow}>
                                  {sourceTxHash && (
                                    <Link
                                      href={`/gmp/${sourceTxHash}${sourceChainData.chain_type === 'cosmos' && c.id ? `?commandId=${c.id}` : ''}`}
                                      target="_blank"
                                      className={styles.gmpLink}
                                    >
                                      GMP
                                    </Link>
                                  )}
                                  <Tooltip
                                    content={sourceChainData.name}
                                    className={styles.chainTooltip}
                                  >
                                    <Image
                                      src={sourceChainData.image}
                                      alt=""
                                      width={20}
                                      height={20}
                                    />
                                  </Tooltip>
                                  {contractAddress && (
                                    <>
                                      <MdOutlineCode
                                        size={20}
                                        className={styles.codeIcon}
                                      />
                                      {destinationChainData && (
                                        <Tooltip
                                          content={destinationChainData.name}
                                          className={styles.chainTooltip}
                                        >
                                          <Image
                                            src={destinationChainData.image}
                                            alt=""
                                            width={20}
                                            height={20}
                                          />
                                        </Tooltip>
                                      )}
                                      <Profile
                                        address={contractAddress}
                                        chain={d.chain}
                                        width={20}
                                        height={20}
                                      />
                                    </>
                                  )}
                                </div>
                              )}
                              {type === 'mintToken' && (
                                <div className={styles.mintTransferRow}>
                                  <Link
                                    href={`/transfer?transferId=${transferID}`}
                                    target="_blank"
                                    className={styles.transferLink}
                                  >
                                    Transfer
                                  </Link>
                                  {account && (
                                    <>
                                      <MdOutlineCode
                                        size={20}
                                        className={styles.codeIcon}
                                      />
                                      <Profile
                                        address={account}
                                        chain={d.chain}
                                        width={20}
                                        height={20}
                                      />
                                    </>
                                  )}
                                </div>
                              )}
                              {salt && (
                                <div className={styles.saltRow}>
                                  <span className={styles.saltLabel}>
                                    {deposit_address
                                      ? 'Deposit address'
                                      : 'Salt'}
                                    :
                                  </span>
                                  {deposit_address ? (
                                    <Copy size={16} value={deposit_address}>
                                      <Link
                                        href={`/account/${deposit_address}`}
                                        target="_blank"
                                        className={styles.saltValue}
                                      >
                                        {ellipse(deposit_address, 6, '0x')}
                                      </Link>
                                    </Copy>
                                  ) : (
                                    <Copy size={16} value={salt}>
                                      <span className={styles.saltValue}>
                                        {ellipse(salt, 6, '0x')}
                                      </span>
                                    </Copy>
                                  )}
                                </div>
                              )}
                              {name && (
                                <div className={styles.tokenNameWrapper}>
                                  <span className={styles.tokenNameText}>
                                    {name}
                                  </span>
                                  <div className={styles.tokenDetailRow}>
                                    {decimals > 0 && (
                                      <Number
                                        value={decimals}
                                        prefix="Decimals: "
                                        className={styles.tokenDetailText}
                                      />
                                    )}
                                    {(cap ?? 0) > 0 && (
                                      <Number
                                        value={cap}
                                        prefix="Cap: "
                                        className={styles.tokenDetailText}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                              {newOwners && (
                                <Number
                                  value={
                                    split(newOwners, { delimiter: ';' })
                                      .length
                                  }
                                  suffix={' New Owners'}
                                  className={styles.ownersPill}
                                />
                              )}
                              {newOperators && (
                                <div className={styles.operatorsRow}>
                                  <Number
                                    value={
                                      split(newOperators, { delimiter: ';' })
                                        .length
                                    }
                                    suffix={' New Operators'}
                                    className={styles.operatorsPill}
                                  />
                                  {newWeights && (
                                    <Number
                                      value={_.sum(
                                        split(newWeights, {
                                          delimiter: ';',
                                        }).map((w: string) => toNumber(w))
                                      )}
                                      prefix="["
                                      suffix="]"
                                      className={styles.weightsText}
                                    />
                                  )}
                                </div>
                              )}
                              {newThreshold && (
                                <Number
                                  value={newThreshold}
                                  prefix={'Threshold: '}
                                  className={styles.thresholdText}
                                />
                              )}
                            </div>
                          );
                        })}
                        {toArray(d.commands).length >
                          NUM_COMMANDS_TRUNCATE && (
                          <Link
                            href={`/evm-batch/${d.chain}/${d.batch_id}`}
                            target="_blank"
                            className={styles.moreCommandsLink}
                          >
                            <Number
                              value={
                                toArray(d.commands).length -
                                NUM_COMMANDS_TRUNCATE
                              }
                              prefix={'and '}
                              suffix={' more'}
                            />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className={styles.tdRight}>
                      <div className={styles.statusWrapper}>
                        {status && (
                          <Tag
                            className={clsx(
                              styles.statusTagBase,
                              ['executed'].includes(status)
                                ? styles.statusTagExecuted
                                : ['signed'].includes(status)
                                  ? styles.statusTagSigned
                                  : ['signing'].includes(status)
                                    ? styles.statusTagSigning
                                    : styles.statusTagAborted
                            )}
                          >
                            {status}
                          </Tag>
                        )}
                      </div>
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
        {(total ?? 0) > PAGE_SIZE && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={PAGE_SIZE} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}
