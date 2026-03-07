'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import * as styles from './NavLink.styles';
import type { NavLinkProps } from './NavLink.types';

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={clsx(
        styles.base,
        href === pathname
          ? styles.active
          : styles.inactive
      )}
    >
      {children}
    </Link>
  );
}
