'use client';

import Link from 'next/link';

import { ChainProfile, Profile } from '@/components/Profile';

import { MessageAmountValue } from './MessageAmountValue.component';
import { MessageHashList } from './MessageHashList.component';
import type { MessageFieldValueProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function MessageFieldValue({ field }: MessageFieldValueProps) {
  if (field.kind === 'amount') {
    return <MessageAmountValue amount={field.amount} />;
  }

  if (field.kind === 'chain') {
    return <ChainProfile value={field.chain} />;
  }

  if (field.kind === 'hash') {
    return (
      <MessageHashList
        hashes={field.hashes}
        chain={field.chain}
        gmp={field.gmp}
      />
    );
  }

  if (field.kind === 'link') {
    return (
      <Link href={field.href} target="_blank" className={styles.blockLink}>
        {field.text}
      </Link>
    );
  }

  if (field.kind === 'text') {
    return <span>{field.text}</span>;
  }

  // Without the operator prefix a validator address links to /account instead
  // of /validator, and shows as "axelarvalo...k00w" when no moniker resolves.
  // Every other validator call site in the app passes it the same way.
  return (
    <Profile
      address={field.address}
      prefix={field.kind === 'validator' ? 'axelarvaloper' : 'axelar'}
    />
  );
}
