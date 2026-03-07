import clsx from 'clsx';

import { Image } from '@/components/Image';
import { JSONView } from '@/components/JSONView';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { getChainData } from '@/lib/config';
import { toJson } from '@/lib/parser';

import type { StatusTagProps, PlanInfoProps, ChangeRowProps, GmpChainIconProps } from './Proposal.types';
import * as styles from './Proposal.styles';

export function StatusTag({ status }: StatusTagProps) {
  const className = clsx(
    'w-fit',
    ['UNSPECIFIED', 'DEPOSIT_PERIOD'].includes(status)
      ? ''
      : ['VOTING_PERIOD'].includes(status)
        ? 'bg-yellow-400 dark:bg-yellow-500'
        : ['REJECTED', 'FAILED'].includes(status)
          ? 'bg-red-600 dark:bg-red-500'
          : 'bg-green-600 dark:bg-green-500'
  );

  return <Tag className={className}>{status}</Tag>;
}

export function PlanInfo({ info, type: _type }: PlanInfoProps) {
  if (typeof toJson(info) === 'object') {
    return <JSONView value={info} />;
  }

  return <div className={styles.infoCodeBlock}>{info}</div>;
}

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

export function GmpChainIcon({ chain, chains }: GmpChainIconProps) {
  const { name, image } = { ...getChainData(chain, chains) };
  return (
    <div className={styles.gmpChainItem}>
      <Tooltip content={name}>
        <Image src={image} alt="" width={20} height={20} />
      </Tooltip>
    </div>
  );
}
