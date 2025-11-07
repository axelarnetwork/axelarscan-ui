import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { GMPTransactionInfo } from '../GMP.types';
import { infoStyles } from './Info.styles';
import { InfoHeaderProps } from './Info.types';
import { ellipse } from '@/lib/string';
import { isNumber } from '@/lib/number';

export function InfoHeader({
  call,
  messageId,
  txhash,
  url,
  transactionPath,
  sourceChain,
}: InfoHeaderProps) {
  if (!txhash) {
    return null;
  }

  const proposalOrTxLink = call?.proposal_id
    ? `/proposal/${call.proposal_id}`
    : url && transactionPath
      ? `${url}${transactionPath.replace('{tx}', txhash)}`
      : undefined;

  return (
    <div className={infoStyles.headerSubtitle}>
      <div className={infoStyles.flexRow}>
        <Copy value={messageId || txhash}>
          {proposalOrTxLink ? (
            <Link href={proposalOrTxLink} target="_blank" className={infoStyles.iconButton}>
              {ellipse(messageId || txhash, 12)}
            </Link>
          ) : (
            ellipse(messageId || txhash, 12)
          )}
        </Copy>
        {!call?.proposal_id && call?.transactionHash && (
          <ExplorerLink
            value={txhash}
            chain={sourceChain}
            hasEventLog={call.chain_type === 'evm' && isNumber(call.logIndex)}
          />
        )}
      </div>
    </div>
  );
}


