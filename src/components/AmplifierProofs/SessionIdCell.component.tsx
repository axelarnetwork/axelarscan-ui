import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { ExplorerLink } from '@/components/ExplorerLink';
import { ellipse } from '@/lib/string';

import type { SessionIdCellProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function SessionIdCell({ proof, chain }: SessionIdCellProps) {
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
