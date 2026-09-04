'use client';

import { Profile } from '@/components/Profile';

import { MessageAmountValue } from './MessageAmountValue.component';
import type { MessageFieldValueProps } from './Transaction.types';

export function MessageFieldValue({ field }: MessageFieldValueProps) {
  if (field.kind === 'amount') {
    return <MessageAmountValue amount={field.amount} />;
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
