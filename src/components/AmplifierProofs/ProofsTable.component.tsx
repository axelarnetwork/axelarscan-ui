'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import {
  headString,
  ellipse,
  toTitle,
  removeHexPrefix,
} from '@/lib/string';

import type {
  SignOptionEntry,
  MessageEntry,
  AmplifierProofEntry,
  ProofsTableProps,
  ProofRowProps,
  SessionIdCellProps,
  MessagesCellProps,
  HeightCellProps,
  StatusCellProps,
  ParticipationsCellProps,
} from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function ProofsTable({ data, chains }: ProofsTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.theadTr}>
            <th scope="col" className={styles.thSessionId}>Session ID</th>
            <th scope="col" className={styles.thDefault}>Messages</th>
            <th scope="col" className={styles.thDefault}>Height</th>
            <th scope="col" className={styles.thDefault}>Status</th>
            <th scope="col" className={styles.thDefault}>Participations</th>
            <th scope="col" className={styles.thTime}>Time</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((d: AmplifierProofEntry) => (
            <ProofRow key={d.id} proof={d} chains={chains} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProofRow({ proof, chains }: ProofRowProps) {
  const chain = proof.chain || proof.destination_chain;

  return (
    <tr className={styles.tr}>
      <td className={styles.tdSessionId}>
        <SessionIdCell proof={proof} chain={chain} />
      </td>
      <td className={styles.tdDefault}>
        <MessagesCell proof={proof} chains={chains} />
      </td>
      <td className={styles.tdDefault}>
        <HeightCell height={proof.height} />
      </td>
      <td className={styles.tdDefault}>
        <StatusCell status={proof.status} />
      </td>
      <td className={styles.tdDefault}>
        <ParticipationsCell proof={proof} />
      </td>
      <td className={styles.tdTime}>
        <TimeAgo timestamp={proof.created_at?.ms} />
      </td>
    </tr>
  );
}

function SessionIdCell({ proof, chain }: SessionIdCellProps) {
  return (
    <div className={styles.flexColGapSmall}>
      <div className={styles.flexItemsGap1}>
        <Copy value={`${chain}-${proof.session_id}`}>
          <Link
            href={`/amplifier-proof/${proof.id}`}
            target="_blank"
            className={styles.linkBlue}
          >
            {chain}-{proof.session_id}
          </Link>
        </Copy>
        {proof.gateway_txhash && (
          <ExplorerLink value={proof.gateway_txhash} chain={chain} />
        )}
      </div>
      {proof.multisig_prover_contract_address && (
        <div className={styles.flexItems}>
          <Tooltip
            content="Multisig Prover Contract"
            className={styles.tooltipWhitespace}
          >
            <Copy value={proof.multisig_prover_contract_address}>
              {ellipse(proof.multisig_prover_contract_address)}
            </Copy>
          </Tooltip>
        </div>
      )}
      {proof.multisig_contract_address && (
        <div className={styles.flexItems}>
          <Tooltip
            content="Multisig Contract"
            className={styles.tooltipWhitespace}
          >
            <Copy value={proof.multisig_contract_address}>
              {ellipse(proof.multisig_contract_address)}
            </Copy>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function MessagesCell({ proof, chains }: MessagesCellProps) {
  const messages = toArray(
    proof.message_ids || {
      message_id: proof.message_id,
      source_chain: proof.source_chain,
    }
  ) as MessageEntry[];

  return (
    <div className={styles.flexColGapSmall}>
      {messages.map((m: MessageEntry, i: number) => {
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
          <div key={i} className={styles.flexItemsGap4}>
            <ChainProfile value={m.source_chain} />
            <div className={styles.flexItemsGap1}>
              <Copy value={removeHexPrefix(m.message_id)}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', headString(removeHexPrefix(m.message_id)) ?? '')}`}
                  target="_blank"
                  className={styles.linkBlue}
                >
                  {ellipse(removeHexPrefix(m.message_id)).toUpperCase()}
                </Link>
              </Copy>
              <ExplorerLink
                value={headString(removeHexPrefix(m.message_id))}
                chain={m.source_chain}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeightCell({ height }: HeightCellProps) {
  if (!height) return null;

  return (
    <Link
      href={`/block/${height}`}
      target="_blank"
      className={styles.linkBlueMedium}
    >
      <Number value={height} />
    </Link>
  );
}

function StatusCell({ status }: StatusCellProps) {
  if (!status) return null;

  return (
    <div className={styles.flexColGap1}>
      <Tag
        className={clsx(
          styles.statusTagBase,
          ['completed'].includes(status)
            ? styles.statusCompleted
            : ['failed'].includes(status)
              ? styles.statusFailed
              : ['expired'].includes(status)
                ? styles.statusExpired
                : styles.statusPending
        )}
      >
        {status}
      </Tag>
    </div>
  );
}

function ParticipationsCell({ proof }: ParticipationsCellProps) {
  return (
    <Link
      href={`/amplifier-proof/${proof.id}`}
      target="_blank"
      className={styles.linkFitItems}
    >
      {proof.signOptions.map((s: SignOptionEntry, i: number) => (
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
              : styles.signOptionOther
          )}
        />
      ))}
    </Link>
  );
}
