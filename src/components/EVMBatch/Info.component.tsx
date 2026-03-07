'use client';

import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import { MdOutlineArrowBack, MdOutlineCode } from 'react-icons/md';

import { Copy } from '@/components/Copy';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { ChainProfile, Profile } from '@/components/Profile';
import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { getAssetData, getChainData } from '@/lib/config';
import { formatUnits, toNumber } from '@/lib/number';
import { split, toArray, toCase } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';

import type { BatchCommand, InfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function Info({ data, chain, id, executeButton }: InfoProps) {
  const chains = useChains();
  const assets = useAssets();

  const {
    key_id,
    commands,
    created_at,
    execute_data,
    prev_batched_commands_id,
  } = { ...data };
  let { signatures } = { ...data?.proof };

  signatures = toArray(signatures || data?.signature) as string[];

  const { gateway, explorer } = { ...getChainData(chain, chains) };
  const { url, address_path, transaction_path } = { ...explorer };

  const executed =
    commands && commands.length === commands.filter((c: BatchCommand) => c.executed).length;
  const status = executed
    ? 'executed'
    : toCase(data?.status?.replace('BATCHED_COMMANDS_STATUS_', ''), 'lower');

  return (
    <div className={styles.infoWrapper}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={id}>
            <span>{ellipse(id, 16)}</span>
          </Copy>
          {key_id && (
            <Copy size={16} value={key_id}>
              <span className={styles.keyIdLabel}>
                {key_id}
              </span>
            </Copy>
          )}
        </h3>
        <div className={styles.prevBatchWrapper}>
          {prev_batched_commands_id && (
            <Link
              href={`/evm-batch/${chain}/${prev_batched_commands_id}`}
              className={styles.prevBatchLink}
            >
              <MdOutlineArrowBack size={18} />
              <span>
                Previous Batch ({ellipse(prev_batched_commands_id, 8)})
              </span>
            </Link>
          )}
        </div>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.dlDivider}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Chain
            </dt>
            <dd className={styles.ddValue}>
              {url && gateway?.address ? (
                <Link
                  href={`${url}${address_path?.replace('{address}', gateway.address)}`}
                  target="_blank"
                >
                  <ChainProfile value={chain} />
                </Link>
              ) : (
                <ChainProfile value={chain} />
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Status
            </dt>
            <dd className={styles.ddValue}>
              {status && (
                <div className={styles.statusWrapper}>
                  <Tag
                    className={clsx(
                      'w-fit capitalize',
                      ['executed'].includes(status)
                        ? 'bg-green-600 dark:bg-green-500'
                        : ['signed'].includes(status)
                          ? 'bg-orange-500 dark:bg-orange-600'
                          : ['signing'].includes(status)
                            ? 'bg-yellow-400 dark:bg-yellow-500'
                            : 'bg-red-600 dark:bg-red-500'
                    )}
                  >
                    {status}
                  </Tag>
                  {executeButton}
                </div>
              )}
            </dd>
          </div>
          {commands && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>{`Command${commands.length > 1 ? `s (${commands.length})` : ''}`}</dt>
              <dd className={styles.ddValue}>
                <div className={styles.tableScrollWrapper}>
                  <table className={styles.table}>
                    <thead className={styles.tableHead}>
                      <tr className={styles.tableHeadRow}>
                        <th
                          scope="col"
                          className={styles.thFirst}
                        >
                          ID
                        </th>
                        <th scope="col" className={styles.thMiddle}>
                          Command
                        </th>
                        <th
                          scope="col"
                          className={styles.thLast}
                        >
                          Parameters
                        </th>
                      </tr>
                    </thead>
                    <tbody className={styles.tableBody}>
                      {commands.map((c: BatchCommand, i: number) => {
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
                          assetData?.addresses?.[chain]?.symbol ||
                          assetData?.symbol ||
                          symbol;
                        decimals =
                          assetData?.addresses?.[chain]?.decimals ||
                          assetData?.decimals ||
                          decimals ||
                          18;
                        const image =
                          assetData?.addresses?.[chain]?.image ||
                          assetData?.image;

                        const sourceChainData = getChainData(
                          sourceChain,
                          chains
                        );
                        const destinationChainData = getChainData(
                          chain,
                          chains
                        );

                        const IDElement = (
                          <span className={styles.commandIdText}>
                            {ellipse(c.id, 6)}
                          </span>
                        );

                        const typeElement = (
                          <div className={styles.commandTypeWrapper}>
                            <Tooltip
                              content={c.executed ? 'Executed' : 'Unexecuted'}
                            >
                              <Tag
                                className={clsx(
                                  c.executed
                                    ? styles.commandTagExecuted
                                    : styles.commandTagUnexecuted
                                )}
                              >
                                {type}
                              </Tag>
                            </Tooltip>
                          </div>
                        );

                        return (
                          <tr
                            key={i}
                            className={styles.tableRow}
                          >
                            <td className={styles.tdFirst}>
                              {url && c.transactionHash ? (
                                <Copy size={16} value={c.id}>
                                  <Link
                                    href={`${url}${transaction_path?.replace('{tx}', c.transactionHash)}`}
                                    target="_blank"
                                    className={styles.linkBlue}
                                  >
                                    {IDElement}
                                  </Link>
                                </Copy>
                              ) : (
                                <Copy size={16} value={c.id}>
                                  {IDElement}
                                </Copy>
                              )}
                            </td>
                            <td className={styles.tdMiddle}>
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
                            </td>
                            <td className={styles.tdLast}>
                              <div className={styles.paramsWrapper}>
                                {symbol &&
                                  !['approveContractCall'].includes(type!) && (
                                    <div className={styles.assetBadge}>
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
                                  <div className={styles.sourceChainWrapper}>
                                    {sourceTxHash && (
                                      <Link
                                        href={`/gmp/${sourceTxHash}${sourceChainData.chain_type === 'cosmos' && c.id ? `?commandId=${c.id}` : ''}`}
                                        target="_blank"
                                        className={styles.linkBlueMedium}
                                      >
                                        GMP
                                      </Link>
                                    )}
                                    <Tooltip
                                      content={sourceChainData.name}
                                      className={styles.tooltipNoWrap}
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
                                            className={styles.tooltipNoWrap}
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
                                          chain={chain}
                                          width={20}
                                          height={20}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
                                {type === 'mintToken' && (
                                  <div className={styles.mintTransferWrapper}>
                                    <Link
                                      href={`/transfer?transferId=${transferID}`}
                                      target="_blank"
                                      className={styles.linkBlueMedium}
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
                                          chain={chain}
                                          width={20}
                                          height={20}
                                        />
                                      </>
                                    )}
                                  </div>
                                )}
                                {salt && (
                                  <div className={styles.saltWrapper}>
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
                                          className={styles.saltLabel}
                                        >
                                          {ellipse(deposit_address, 6, '0x')}
                                        </Link>
                                      </Copy>
                                    ) : (
                                      <Copy size={16} value={salt}>
                                        <span className={styles.saltLabel}>
                                          {ellipse(salt, 6, '0x')}
                                        </span>
                                      </Copy>
                                    )}
                                  </div>
                                )}
                                {name && (
                                  <div className={styles.nameWrapper}>
                                    <span className={styles.nameText}>
                                      {name}
                                    </span>
                                    <div className={styles.nameDetailsRow}>
                                      {decimals > 0 && (
                                        <Number
                                          value={decimals}
                                          prefix="Decimals: "
                                          className={styles.nameDetail}
                                        />
                                      )}
                                      {cap != null && cap > 0 && (
                                        <Number
                                          value={cap}
                                          prefix="Cap: "
                                          className={styles.nameDetail}
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
                                    className={styles.ownersBadge}
                                  />
                                )}
                                {newOperators && (
                                  <div className={styles.operatorsWrapper}>
                                    <Number
                                      value={
                                        split(newOperators, { delimiter: ';' })
                                          .length
                                      }
                                      suffix={' New Operators'}
                                      className={styles.operatorsBadge}
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Time
            </dt>
            <dd className={styles.ddValue}>
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              {executed ? 'Signed Commands' : 'Execute Data'}
            </dt>
            <dd className={styles.ddValue}>
              {execute_data && (
                <div className={styles.dataWrapper}>
                  <Tag className={styles.dataTag}>
                    {ellipse(execute_data, 256)}
                  </Tag>
                  <Copy value={execute_data} className={styles.dataCopy} />
                </div>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Data
            </dt>
            <dd className={styles.ddValue}>
              {data?.data && (
                <div className={styles.dataWrapper}>
                  <Tag className={styles.dataTag}>
                    {ellipse(data.data, 256)}
                  </Tag>
                  <Copy value={data.data} className={styles.dataCopy} />
                </div>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>{`Signature${signatures!.length > 1 ? `s (${signatures!.length})` : ''}`}</dt>
            <dd className={styles.ddValue}>
              <div className={styles.signaturesGrid}>
                {signatures!.map((d: string, i: number) => (
                  <Copy key={i} size={14} value={d}>
                    <span className={styles.signatureText}>
                      {ellipse(d, 8)}
                    </span>
                  </Copy>
                ))}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
