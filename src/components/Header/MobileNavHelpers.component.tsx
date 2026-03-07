'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover } from '@headlessui/react';
import clsx from 'clsx';

import { mobileNavLink, mobileNavIcon, mobileNavigation } from './Header.styles';
import type { MobileNavLinkProps, MobileNavIconProps, NavigationGroupProps } from './Header.types';

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

export function MobileNavIcon({ open }: MobileNavIconProps) {
  return (
    <svg aria-hidden="true" className={mobileNavIcon.svg} fill="none" strokeWidth={2} strokeLinecap="round">
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(mobileNavIcon.pathTransition, open && mobileNavIcon.pathHidden)}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(mobileNavIcon.pathTransition, !open && mobileNavIcon.pathHidden)}
      />
    </svg>
  );
}

export function NavigationGroup({ item }: NavigationGroupProps) {
  if (!item.children) {
    if (!item.href) return null;
    return (
      <MobileNavLink href={item.href} className={mobileNavigation.topLevelLink}>
        {item.title}
      </MobileNavLink>
    );
  }

  return (
    <div className={mobileNavigation.group}>
      <span className={mobileNavigation.groupTitle}>{item.title}</span>
      {item.children.map((c, j) => (
        <MobileNavLink key={j} href={c.href}>
          {c.title}
        </MobileNavLink>
      ))}
    </div>
  );
}
