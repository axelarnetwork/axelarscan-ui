import Link from 'next/link';
import clsx from 'clsx';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { equalsIgnoreCase, ellipse, toTitle } from '@/lib/string';

import type { SignRowProps } from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';

export function SignRow({ sign: d, index: i, confirmationTxhash }: SignRowProps) {
  const sign = d.sign ? 'signed' : 'unsubmitted';

  return (
    <tr className={styles.tr}>
      <td className={styles.tdFirst}>{i + 1}</td>
      <td className={styles.tdMiddle}>
        {d.verifierData ? (
          <Profile i={i} address={d.verifierData.address} />
        ) : (
          <Copy value={d.signer}>
            <Link
              href={`/verifier/${d.signer}`}
              target="_blank"
              className={styles.signerLink}
            >
              {ellipse(d.signer, 10, '0x')}
            </Link>
          </Copy>
        )}
      </td>
      <td className={styles.tdMiddle}>
        {d.id && (
          <div className={styles.txHashWrapper}>
            <Copy value={d.id}>
              <Link
                href={`/tx/${d.id}`}
                target="_blank"
                className={styles.txHashLink}
              >
                {ellipse(d.id, 6)}
              </Link>
            </Copy>
            {equalsIgnoreCase(d.id, confirmationTxhash) && (
              <Link
                href={`/tx/${confirmationTxhash}`}
                target="_blank"
                className={styles.confirmationRow}
              >
                <IoCheckmarkDoneCircle
                  size={18}
                  className={styles.confirmationIcon}
                />
                <span className={styles.confirmationLabel}>Confirmation</span>
              </Link>
            )}
          </div>
        )}
      </td>
      <td className={styles.tdMiddle}>
        {d.height && (
          <Link
            href={`/block/${d.height}`}
            target="_blank"
            className={styles.blockLink}
          >
            <Number value={d.height} />
          </Link>
        )}
      </td>
      <td className={styles.tdRight}>
        <div className={styles.signWrapper}>
          <Tag
            className={clsx(
              styles.statusTagBase,
              sign === 'signed'
                ? styles.signOptionSigned
                : styles.signOptionUnsubmitted
            )}
          >
            {toTitle(sign)}
          </Tag>
        </div>
      </td>
      <td className={styles.tdLast}>
        <TimeAgo timestamp={d.created_at} />
      </td>
    </tr>
  );
}
