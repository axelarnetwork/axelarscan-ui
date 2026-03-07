import Link from 'next/link';
import { MdOutlineCode } from 'react-icons/md';

import { Profile } from '@/components/Profile';

import type { MintTransferInfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function MintTransferInfo({
  transferID,
  account,
  chain,
}: MintTransferInfoProps) {
  return (
    <div className={styles.mintTransferWrapper}>
      <Link
        href={`/transfer?transferId=${transferID}`}
        target="_blank"
        className={styles.linkBlueMedium}
      >
        Transfer
      </Link>
      {account && (
        <>
          <MdOutlineCode size={20} className={styles.codeIcon} />
          <Profile address={account} chain={chain} width={20} height={20} />
        </>
      )}
    </div>
  );
}
