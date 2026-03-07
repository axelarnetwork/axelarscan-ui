import Link from 'next/link';

import { Copy } from '@/components/Copy';
import { Number } from '@/components/Number';
import { getAssetData } from '@/lib/config';
import { ellipse } from '@/lib/string';
import { isNumber } from '@/lib/number';

import type { AddressRowProps, DelegationRowProps } from './Validator.types';
import * as styles from './Validator.styles';

export function AddressRow({ label, value, children }: AddressRowProps) {
  return (
    <div className={styles.dlRow}>
      <dt className={styles.dlLabel}>{label}</dt>
      <dd className={styles.dlValue}>
        <Copy value={value}>{children}</Copy>
      </dd>
    </div>
  );
}

export function DelegationRow({ d, assets }: DelegationRowProps) {
  const { price } = { ...getAssetData(d.denom, assets) } as Record<string, unknown>;

  return (
    <tr className={styles.delegationsRow}>
      <td className={styles.delegationsTdFirst}>
        <Copy size={14} value={d.delegator_address}>
          <Link
            href={`/account/${d.delegator_address}`}
            target="_blank"
            className={styles.delegatorLink}
          >
            {ellipse(d.delegator_address, 6, 'axelar')}
          </Link>
        </Copy>
      </td>
      <td className={styles.delegationsTdMiddle}>
        <div className={styles.delegationsAmountWrapper}>
          <Number
            value={d.amount}
            className={styles.delegationsAmountValue}
          />
        </div>
      </td>
      <td className={styles.delegationsTdLast}>
        {isNumber(d.amount) && isNumber(price) && (
          <div className={styles.delegationsAmountWrapper}>
            <Number
              value={d.amount! * (price as number)}
              prefix="$"
              noTooltip={true}
              className={styles.delegationsValueNumber}
            />
          </div>
        )}
      </td>
    </tr>
  );
}
