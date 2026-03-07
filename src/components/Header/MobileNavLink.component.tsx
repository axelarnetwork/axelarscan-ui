'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover } from '@headlessui/react';
import clsx from 'clsx';

import { mobileNavLink } from './Header.styles';
import type { MobileNavLinkProps } from './Header.types';

export function MobileNavLink({ href, children, className }: MobileNavLinkProps) {
  const pathname = usePathname();

  return (
    <Popover.Button
      as={Link}
      href={href}
      className={clsx(
        mobileNavLink.base,
        href === pathname ? mobileNavLink.active : mobileNavLink.inactive,
        className
      )}
    >
      {children}
    </Popover.Button>
  );
}
