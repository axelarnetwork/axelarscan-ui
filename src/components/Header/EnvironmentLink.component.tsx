'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { ENVIRONMENT } from '@/lib/config';

import type { EnvironmentLinkProps } from './Header.types';
import { environmentLink } from './Header.styles';

export function EnvironmentLink({
  name,
  href,
  children,
}: EnvironmentLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        environmentLink.base,
        name === ENVIRONMENT ? environmentLink.active : environmentLink.inactive
      )}
    >
      {children}
    </Link>
  );
}
