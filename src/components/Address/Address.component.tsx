'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Container } from '@/components/Container';
import { GMPs } from '@/components/GMPs';
import { Transfers } from '@/components/Transfers';
import { getParams, getQueryString } from '@/lib/operator';

import {
  containerClass,
  outerWrapperClass,
  navClass,
  tabActiveClass,
  tabInactiveClass,
  tabBaseClass,
  contentWrapperClass,
} from './Address.styles';
import type { AddressProps } from './Address.types';

const TABS = ['gmp', 'transfers'] as const;

export function Address({ address }: AddressProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<Record<string, any>>(getParams(searchParams));

  useEffect(() => {
    const params = getParams(searchParams);

    if (address) {
      if (!params.transfersType) {
        setParams({ ...params, transfersType: TABS[0] });
      } else {
        setParams(params);
      }
    }
  }, [address, searchParams, setParams]);

  useEffect(() => {
    if (address && params) {
      router.push(`/address/${address}${getQueryString(params)}`);
    }
  }, [address, router, params]);

  const { transfersType } = { ...params };

  return (
    address &&
    transfersType && (
      <Container className={containerClass}>
        <div className={outerWrapperClass}>
          <nav className={navClass}>
            {TABS.map((type, i) => (
              <button
                key={i}
                onClick={() => setParams({ transfersType: type })}
                className={clsx(
                  tabBaseClass,
                  type === transfersType ? tabActiveClass : tabInactiveClass
                )}
              >
                {type === 'gmp'
                  ? 'General Message Passing'
                  : type === 'transfers'
                    ? 'Token Transfers'
                    : type}
              </button>
            ))}
          </nav>
          <div className={contentWrapperClass}>
            {transfersType === 'gmp' ? (
              <GMPs address={address} />
            ) : (
              <Transfers address={address} />
            )}
          </div>
        </div>
      </Container>
    )
  );
}
