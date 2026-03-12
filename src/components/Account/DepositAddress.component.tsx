import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile';
import { ellipse } from '@/lib/string';
import type { DepositAddressProps } from './Account.types';
import * as styles from './Account.styles';

export function DepositAddress({ data, address }: DepositAddressProps) {
  const { depositAddressData, transferData } = { ...data };

  const {
    source_chain,
    destination_chain,
    denom,
    sender_address,
    recipient_address,
  } = { ...(transferData?.link || depositAddressData) };
  const { txhash } = { ...transferData?.send };

  const sourceChain = transferData?.send?.source_chain || source_chain;
  const destinationChain =
    transferData?.send?.destination_chain || destination_chain;
  const senderAddress = transferData?.send?.sender_address || sender_address;
  const destinationAddress =
    transferData?.send?.recipient_address || recipient_address;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Profile address={address} />
        </h3>
      </div>
      <div className={styles.cardBorder}>
        <dl className={styles.cardDivider}>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Source</dt>
            <dd className={styles.detailValue}>
              <div className={styles.detailValueCol}>
                <ChainProfile value={sourceChain} />
                <Profile address={senderAddress} chain={sourceChain} />
              </div>
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Destination</dt>
            <dd className={styles.detailValue}>
              <div className={styles.detailValueCol}>
                <ChainProfile value={destinationChain} />
                <Profile
                  address={destinationAddress}
                  chain={destinationChain}
                />
              </div>
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>Asset</dt>
            <dd className={styles.detailValue}>
              <AssetProfile value={denom} />
            </dd>
          </div>
          {txhash && (
            <div className={styles.detailRow}>
              <dt className={styles.detailLabel}>Transfer</dt>
              <dd className={styles.detailValue}>
                <Copy value={txhash}>
                  <Link
                    href={`/transfer/${txhash}`}
                    target="_blank"
                    className={styles.transferLink}
                  >
                    {ellipse(txhash)}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
