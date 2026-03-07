'use client';

import Link from 'next/link';
import clsx from 'clsx';
import moment from 'moment';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import {
  headString,
  ellipse,
  toTitle,
  removeHexPrefix,
} from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';

import type { InfoProps, MessageId, SignOption } from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';

export function Info({ data, id }: InfoProps) {
  const chains = useChains();

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
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Copy value={chain && session_id ? `${chain}-${session_id}` : id}>
            <span>
              {chain && session_id ? `${chain}-${session_id}` : ellipse(id, 16)}
            </span>
          </Copy>
        </h3>
      </div>
      <div className={styles.infoBorderTop}>
        <dl className={styles.dlDivider}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Chain
            </dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={chain} />
            </dd>
          </div>
          {multisig_prover_contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Multisig Prover Contract
              </dt>
              <dd className={styles.ddValue}>
                <Copy value={multisig_prover_contract_address}>
                  {ellipse(multisig_prover_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          {multisig_contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Multisig Contract
              </dt>
              <dd className={styles.ddValue}>
                <Copy value={multisig_contract_address}>
                  {ellipse(multisig_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Messages
            </dt>
            <dd className={styles.ddValue}>
              <div className={styles.messageList}>
                {(toArray(
                  message_ids || {
                    message_id: data?.message_id,
                    source_chain: data?.source_chain,
                  }
                ) as MessageId[]).map((m: MessageId, i: number) => {
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
                      <div key={i} className={styles.messageRow}>
                        <ChainProfile value={m.source_chain} />
                        <div className={styles.messageIdRow}>
                          <Copy value={removeHexPrefix(m.message_id)}>
                            <Link
                              href={`${url}${transaction_path?.replace('{tx}', headString(removeHexPrefix(m.message_id)) ?? '')}`}
                              target="_blank"
                              className={styles.messageIdLink}
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
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Status
            </dt>
            <dd className={styles.ddValue}>
              {status && (
                <Tag
                  className={clsx(
                    styles.statusTagBase,
                    ['completed'].includes(status)
                      ? styles.statusTagCompleted
                      : ['failed'].includes(status)
                        ? styles.statusTagFailed
                        : ['expired'].includes(status)
                          ? styles.statusTagExpired
                          : styles.statusTagPending
                  )}
                >
                  {status}
                </Tag>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Height
            </dt>
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
          {gateway_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Gateway Tx Hash
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', gateway_txhash)}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  {ellipse(gateway_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {initiated_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Initiated Tx Hash
              </dt>
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
          {confirmation_txhash && confirmation_txhash !== completed_txhash && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Confirmation Tx Hash
              </dt>
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
              <dt className={styles.dtLabel}>
                Proof Completed Tx Hash
              </dt>
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
          {completed_height && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Completed Height
              </dt>
              <dd className={styles.ddValue}>
                <Link
                  href={`/block/${completed_height}`}
                  target="_blank"
                  className={styles.blockLink}
                >
                  <Number value={completed_height} />
                </Link>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>
              Expires Height
            </dt>
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
            <dt className={styles.dtLabel}>
              Created
            </dt>
            <dd className={styles.ddValue}>
              {created_at?.ms && moment(created_at.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {updated_at?.ms && created_at?.ms && updated_at.ms > created_at.ms && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>
                Updated
              </dt>
              <dd className={styles.ddValue}>
                {moment(updated_at!.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>{`Participants${toArray(participants).length > 1 ? ` (${toArray(participants).length})` : ''}`}</dt>
            <dd className={styles.ddValue}>
              {signOptions && (
                <div className={styles.participantsWrapper}>
                  {signOptions.map((s: SignOption, i: number) => (
                    <Number
                      key={i}
                      value={s.value}
                      format="0,0"
                      suffix={` ${toTitle(s.option.substring(0, ['unsubmitted'].includes(s.option) ? 2 : undefined))}`}
                      noTooltip={true}
                      className={clsx(
                        styles.signOptionBase,
                        ['signed'].includes(s.option)
                          ? styles.signOptionSigned
                          : styles.signOptionUnsubmitted
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
