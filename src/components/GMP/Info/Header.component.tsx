import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { ExplorerLink } from '@/components/ExplorerLink';
import { isNumber } from '@/lib/number';
import { ellipse } from '@/lib/string';
import { headerStyles } from './Header.styles';
import { HeaderProps } from './Header.types';

export function Header({
  call,
  messageId,
  txhash,
  url,
  transactionPath,
  sourceChain,
}: HeaderProps) {
  if (!txhash) {
    return null;
  }

  const proposalOrTxLink = call?.proposal_id
    ? `/proposal/${call.proposal_id}`
    : url && transactionPath
      ? `${url}${transactionPath.replace('{tx}', txhash)}`
      : undefined;

  return (
    <div className={headerStyles.subtitle}>
      <div className={headerStyles.row}>
        <Copy value={messageId || txhash}>
          {proposalOrTxLink ? (
            <Link
              href={proposalOrTxLink}
              target="_blank"
              className={headerStyles.iconButton}
            >
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
