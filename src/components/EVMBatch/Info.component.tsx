'use client';

import Link from 'next/link';
import { MdOutlineArrowBack } from 'react-icons/md';

import { Copy } from '@/components/Copy';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray, toCase } from '@/lib/parser';
import { ellipse } from '@/lib/string';

import type { BatchCommand, InfoProps } from './EVMBatch.types';
import { ChainRow } from './ChainRow.component';
import { StatusRow } from './StatusRow.component';
import { CommandsSection } from './CommandsSection.component';
import { TimeRow } from './TimeRow.component';
import { DataRow } from './DataRow.component';
import { SignaturesRow } from './SignaturesRow.component';
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
    commands &&
    commands.length === commands.filter((c: BatchCommand) => c.executed).length;
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
              <span className={styles.keyIdLabel}>{key_id}</span>
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
          <ChainRow
            url={url}
            addressPath={address_path}
            gatewayAddress={gateway?.address}
            chain={chain}
          />
          <StatusRow status={status} executeButton={executeButton} />
          {commands && (
            <CommandsSection
              commands={commands}
              chain={chain}
              url={url}
              transaction_path={transaction_path}
              chains={chains}
              assets={assets}
            />
          )}
          <TimeRow createdAtMs={created_at?.ms} />
          <DataRow
            label={executed ? 'Signed Commands' : 'Execute Data'}
            value={execute_data}
          />
          <DataRow label="Data" value={data?.data} />
          <SignaturesRow signatures={signatures!} />
        </dl>
      </div>
    </div>
  );
}
