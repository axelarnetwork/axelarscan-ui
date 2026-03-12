'use client';

import Link from 'next/link';
import clsx from 'clsx';
import moment from 'moment';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { ellipse, toTitle } from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';

import type { InfoProps, SignOption } from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';
import { MessageList } from './MessageList.component';
import { TxHashRow } from './TxHashRow.component';

export function Info({ data, id }: InfoProps) {
  const chains = useChains();

  const {
    session_id,
    multisig_prover_contract_address,
    multisig_contract_address,
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
  const showUpdated =
    updated_at?.ms && created_at?.ms && updated_at.ms > created_at.ms;

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
            <dt className={styles.dtLabel}>Chain</dt>
            <dd className={styles.ddValue}>
              <ChainProfile value={chain} />
            </dd>
          </div>
          {multisig_prover_contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Multisig Prover Contract</dt>
              <dd className={styles.ddValue}>
                <Copy value={multisig_prover_contract_address}>
                  {ellipse(multisig_prover_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          {multisig_contract_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Multisig Contract</dt>
              <dd className={styles.ddValue}>
                <Copy value={multisig_contract_address}>
                  {ellipse(multisig_contract_address)}
                </Copy>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Messages</dt>
            <dd className={styles.ddValue}>
              <MessageList data={data} chains={chains} />
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Status</dt>
            <dd className={styles.ddValue}>
              {status && (
                <Tag
                  className={clsx(
                    styles.statusTagBase,
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
          {gateway_txhash && (
            <TxHashRow
              label="Gateway Tx Hash"
              txhash={gateway_txhash}
              external={{ url, transaction_path }}
            />
          )}
          {initiated_txhash && (
            <TxHashRow label="Initiated Tx Hash" txhash={initiated_txhash} />
          )}
          {confirmation_txhash && confirmation_txhash !== completed_txhash && (
            <TxHashRow
              label="Confirmation Tx Hash"
              txhash={confirmation_txhash}
            />
          )}
          {completed_txhash && (
            <TxHashRow
              label="Proof Completed Tx Hash"
              txhash={completed_txhash}
            />
          )}
          {completed_height && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Completed Height</dt>
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
          {showUpdated && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Updated</dt>
              <dd className={styles.ddValue}>
                {moment(updated_at!.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt
              className={styles.dtLabel}
            >{`Participants${toArray(participants).length > 1 ? ` (${toArray(participants).length})` : ''}`}</dt>
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
