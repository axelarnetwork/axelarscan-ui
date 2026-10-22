'use client';

import { Container } from '@/components/Container';
import { GMPs } from '@/components/GMPs';

import { containerClass, contentWrapperClass } from './Address.styles';
import type { AddressProps } from './Address.types';

export function Address({ address }: AddressProps) {
  return (
    address && (
      <Container className={containerClass}>
        <div className={contentWrapperClass}>
          <GMPs address={address} />
        </div>
      </Container>
    )
  );
}
