import { Profile } from '@/components/Profile';

import type { MintTransferInfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function MintTransferInfo({ account, chain }: MintTransferInfoProps) {
  if (!account) return null;

  return (
    <div className={styles.mintTransferWrapper}>
      <Profile address={account} chain={chain} width={20} height={20} />
    </div>
  );
}
