'use client';

import Link from 'next/link';
import clsx from 'clsx';
import moment from 'moment';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink, buildExplorerURL } from '@/components/ExplorerLink';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { ellipse, toTitle } from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';
import type { InfoProps, VoteOption } from './AmplifierPoll.types';
import { getVoteOptionSuffix } from './AmplifierPoll.types';
import * as styles from './AmplifierPoll.styles';

export function Info({ data, id }: InfoProps) {
  const chains = useChains();

  const {
    contract_address,
    transaction_id,
    event_index,
    sender_chain,
    status,
    height,
    initiated_txhash,
    confirmation_txhash,
    completed_txhash,
    expired_height,
    participants,
    voteOptions,
    created_at,
    updated_at,
  } = { ...data };

  const explorer = { ...getChainData(sender_chain, chains)?.explorer };

  const txHref = buildExplorerURL({
    value: transaction_id,
    type: 'tx',
    useContractLink: false,
    hasEventLog: false,
    explorer,
  });

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={data?.poll_id || id}>
            <span>{data?.poll_id || ellipse(id, 16)}</span>
          </Copy>
        </h3>
        <div className={styles.infoSubtitle}>
          {transaction_id && (
            <div className={styles.txIdWrapper}>
              <Copy value={transaction_id}>
                <Link href={txHref} target="_blank" className={styles.txLink}>
                  {ellipse(transaction_id)}
                  {isNumber(event_index) ? `-${event_index}` : ''}
                </Link>
              </Copy>
              <ExplorerLink value={transaction_id} chain={sender_chain} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.dlDivide}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Chain</dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={sender_chain} />
            </dd>
          </div>
          {contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Verifier Contract</dt>
              <dd className={styles.ddValue}>
                <Copy value={contract_address}>
                  {ellipse(contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Status</dt>
            <dd className={styles.ddValue}>
              {status && (
                <Tag
                  className={clsx(
                    'w-fit capitalize',
                    styles.getStatusStyle(status)
                  )}
                >
                  {status}
                </Tag>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Height</dt>
            <dd className={styles.ddValue}>
              {height && (
                <Link
                  href={`/block/${height}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  <Number value={height} />
                </Link>
              )}
            </dd>
          </div>
          {initiated_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Initiated Tx Hash</dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/tx/${initiated_txhash}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(initiated_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {confirmation_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Confirmation Tx Hash</dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/tx/${confirmation_txhash}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(confirmation_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {completed_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Poll Completed Tx Hash</dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/tx/${completed_txhash}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(completed_txhash)}
                </Link>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Expires Height</dt>
            <dd className={styles.ddValue}>
              {expired_height && (
                <Link
                  href={`/block/${expired_height}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  <Number value={expired_height} />
                </Link>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Created</dt>
            <dd className={styles.ddValue}>
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {(updated_at?.ms ?? 0) > (created_at?.ms ?? 0) && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Updated</dt>
              <dd className={styles.ddValue}>
                {moment(updated_at!.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          {participants && (
            <div className={styles.dlRow}>
              <dt
                className={styles.dtLabel}
              >{`Participants${participants.length > 1 ? ` (${participants.length})` : ''}`}</dt>
              <dd className={styles.ddValue}>
                <div className={styles.participantVotes}>
                  {voteOptions!.map((v: VoteOption, i: number) => (
                    <Number
                      key={i}
                      value={v.value}
                      format="0,0"
                      suffix={` ${toTitle(getVoteOptionSuffix(v.option))}`}
                      noTooltip={true}
                      className={clsx(
                        styles.voteOptionTag,
                        styles.getVoteOptionStyle(v.option)
                      )}
                    />
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
