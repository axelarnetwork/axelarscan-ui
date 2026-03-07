'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { ChainProfile } from '@/components/Profile';
import { ExplorerLink } from '@/components/ExplorerLink';
import { TimeAgo } from '@/components/Time';
import { Pagination } from '@/components/Pagination';
import type { Chain } from '@/types';
import { useChains } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import {
  toBoolean,
  headString,
  ellipse,
  toTitle,
  removeHexPrefix,
} from '@/lib/string';

import type {
  SignOptionEntry,
  MessageEntry,
  AmplifierProofEntry,
  BlockData,
  SearchResult,
} from './AmplifierProofs.types';
import { Filters } from './Filters.component';
import * as styles from './AmplifierProofs.styles';
import { buildProofEntry } from './AmplifierProofs.utils';

const size = 25;

export function AmplifierProofs() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, SearchResult> | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const chains = useChains();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as BlockData);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh) || !blockData) return;

      const response = await searchAmplifierProofs({ ...params, size }) as
        Record<string, unknown> | undefined;
      const { data, total } = {
        ...(response as { data?: unknown[]; total?: number }),
      };

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: _.orderBy(
            toArray(data).map((d) => buildProofEntry(d, blockData)),
            ['created_at.ms'],
            ['desc']
          ),
          total: total ?? 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, blockData]);

  const { data, total = 0 } = { ...searchResults?.[generateKeyByParams(params!)] };

  if (!data) {
    return (
      <Container className={styles.proofsContainer}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.proofsContainer}>
      <div>
        <div className={styles.proofsHeaderRow}>
          <div className={styles.proofsHeaderLeft}>
            <div className={styles.proofsNavLinks}>
              <Link href="/evm-batches" className={styles.evmBatchesLink}>
                EVM Batches
              </Link>
              <span className={styles.navDivider}>|</span>
              <h1 className={styles.proofsTitle}>Amplifier Proofs</h1>
            </div>
            <p className={styles.proofsSubtitle}>
              <Number
                value={total}
                suffix={` result${total > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className={styles.proofsActions}>
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
        <ProofsTable data={data} chains={chains} />
        {total > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total} />
          </div>
        )}
      </div>
    </Container>
  );
}

// ─── Table sub-components ────────────────────────────────────────────────────

function ProofsTable({ data, chains }: { data: AmplifierProofEntry[]; chains: Chain[] | null }) {
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

function ProofRow({ proof, chains }: { proof: AmplifierProofEntry; chains: Chain[] | null }) {
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

function SessionIdCell({ proof, chain }: { proof: AmplifierProofEntry; chain: string | undefined }) {
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

function MessagesCell({ proof, chains }: { proof: AmplifierProofEntry; chains: Chain[] | null }) {
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

function HeightCell({ height }: { height: number | undefined }) {
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

function StatusCell({ status }: { status: string }) {
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

function ParticipationsCell({ proof }: { proof: AmplifierProofEntry }) {
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
