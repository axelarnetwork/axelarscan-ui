import React from 'react';

import * as styles from './WalletSelector.styles';
import type { UnsupportedWalletNoticeProps } from './WalletSelector.types';

/**
 * Shown when we cannot map a chain to a wallet integration.
 *
 * Rendering nothing here leaves an action row with no button and no
 * explanation, which reads as a broken page rather than an unsupported chain.
 */
export function UnsupportedWalletNotice({
  targetChain,
}: UnsupportedWalletNoticeProps): React.ReactNode {
  return (
    <span className={styles.unsupportedNotice}>
      Wallet connection is not supported for {targetChain || 'this chain'} yet.
    </span>
  );
}
