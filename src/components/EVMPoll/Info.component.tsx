'use client';

import Link from 'next/link';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';
import type { Validator } from '@/types';

import type { InfoProps, VoteOption, ConfirmationEvent } from './EVMPoll.types';
import * as styles from './EVMPoll.styles';
import { ConfirmationAsset } from './ConfirmationAsset.component';
import { ParticipantOption } from './ParticipantOption.component';

export function Info({ data, id }: InfoProps) {
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  const {
    transaction_id,
    sender_chain,
    eventName,
    confirmation_events,
    status,
    height,
    initiated_txhash,
    confirmation_txhash,
    transfer_id,
    deposit_address,
    participants,
    voteOptions,
    created_at,
    updated_at,
  } = { ...data };

  const { id: chain, explorer } = { ...getChainData(sender_chain, chains) };
  const { url, transaction_path } = { ...explorer };

  const totalParticipantsPower = _.sumBy(
    toArray(validators) as Validator[],
    'quadratic_voting_power'
  );

  const eventElement = (
    <Tag className={clsx(styles.eventTagBase)}>{eventName}</Tag>
  );

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Copy value={id}>
            <span>{ellipse(id, 16)}</span>
          </Copy>
        </h3>
        <div className={styles.infoPanelSubtitle}>
          {transaction_id && (
            <div className={styles.txIdRow}>
              <Copy value={transaction_id}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', transaction_id)}`}
                  target="_blank"
                  className={styles.txIdLink}
                >
                  {ellipse(transaction_id)}
                </Link>
              </Copy>
              <ExplorerLink value={transaction_id} chain={sender_chain} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.infoBorderTop}>
        <dl className={styles.dlDivider}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Chain</dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={sender_chain} />
            </dd>
          </div>
          {eventName && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Event</dt>
              <dd className={styles.ddValue}>
                <div className={styles.eventRow}>
                  {data.url ? (
                    <Link href={data.url} target="_blank">
                      {eventElement}
                    </Link>
                  ) : (
                    eventElement
                  )}
                  {(toArray(confirmation_events) as ConfirmationEvent[]).map(
                    (e, i) => (
                      <ConfirmationAsset
                        key={i}
                        event={e}
                        chain={chain}
                        url={data.url}
                        assets={assets}
                        index={i}
                      />
                    )
                  )}
                </div>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Status</dt>
            <dd className={styles.ddValue}>
              {status && (
                <Tag
                  className={clsx(
                    styles.statusTagBase,
                    styles.getStatusTagStyle(status)
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
          {transfer_id && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Transfer ID</dt>
              <dd className={styles.ddValue}>
                <Copy value={transfer_id}>
                  <Link
                    href={data.url!}
                    target="_blank"
                    className={styles.blockLink}
                  >
                    {transfer_id}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          {deposit_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Deposit Address</dt>
              <dd className={styles.ddValue}>
                <Copy value={deposit_address}>
                  <Link
                    href={`/account/${deposit_address}`}
                    target="_blank"
                    className={styles.accountLink}
                  >
                    {ellipse(deposit_address)}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
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
                <div className={styles.participantsWrapper}>
                  {voteOptions!.map((v: VoteOption, i: number) => (
                    <ParticipantOption
                      key={i}
                      option={v}
                      validators={toArray(validators) as Validator[]}
                      totalParticipantsPower={totalParticipantsPower}
                      createdAtMs={created_at?.ms}
                      index={i}
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
