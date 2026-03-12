import { JSONView } from '@/components/JSONView';
import { Tag } from '@/components/Tag';
import { toJson } from '@/lib/parser';

import type { ChangeRowProps } from './Proposal.types';
import * as styles from './Proposal.styles';

export function ChangeRow({ keyName, value, subspace }: ChangeRowProps) {
  if (typeof toJson(value) === 'object') {
    return (
      <div className={styles.dlRow}>
        <dt className={styles.dtLabel}>{subspace}</dt>
        <dd className={styles.ddValueBold}>
          <div className="flex flex-col gap-y-2">
            <Tag className={styles.changeTag}>{keyName}</Tag>
            <JSONView value={value} />
          </div>
        </dd>
      </div>
    );
  }

  return (
    <div className={styles.dlRow}>
      <dt className={styles.dtLabel}>{subspace}</dt>
      <dd className={styles.ddValueBold}>
        <Tag className={styles.changeTag}>
          {keyName} = {value}
        </Tag>
      </dd>
    </div>
  );
}
