'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';

import { mobileNavLink, mobileNavIcon, mobileNavigation } from './Header.styles';
import type { NavigationItem, MobileNavLinkProps, MobileNavIconProps } from './Header.types';

function MobileNavLink({ href, children, className }: MobileNavLinkProps) {
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

function MobileNavIcon({ open }: MobileNavIconProps) {
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

function NavigationGroup({ item }: { item: NavigationItem }) {
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

export function MobileNavigation({ navigations }: { navigations: NavigationItem[] }) {
  return (
    <Popover>
      <Popover.Button className={mobileNavigation.button} aria-label="Toggle Navigation">
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className={mobileNavigation.overlay} />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel as="div" className={mobileNavigation.panel}>
            {navigations.map((item, i) => (
              <NavigationGroup key={i} item={item} />
            ))}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  );
}
