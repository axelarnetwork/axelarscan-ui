import clsx from 'clsx';

import { Tag } from '@/components/Tag';

import type { StatusTagProps } from './Proposal.types';

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
