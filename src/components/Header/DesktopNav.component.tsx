'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';

import { NavLink } from '@/components/NavLink';

import type { DesktopNavItemProps } from './Header.types';
import { desktopPopover } from './Header.styles';

export function DesktopNavItem({ item, index, popoverOpen, setPopoverOpen }: DesktopNavItemProps) {
  const pathname = usePathname();

  if (!item.children) {
    if (!item.href) return null;
    return (
      <NavLink href={item.href}>
        <div className={desktopPopover.topLevelInner}>{item.title}</div>
      </NavLink>
    );
  }

  const isActive = item.href === pathname || item.children.some(c => c.href === pathname);

  return (
    <Popover
      onMouseEnter={() => setPopoverOpen(index)}
      onMouseLeave={() => setPopoverOpen(null)}
      className={desktopPopover.wrapper}
    >
      <Popover.Button
        className={clsx(
          desktopPopover.button,
          isActive ? desktopPopover.buttonActive : desktopPopover.buttonInactive
        )}
      >
        <Link href={item.children[0].href} className={desktopPopover.linkInner}>
          <span>{item.title}</span>
          <FiChevronDown className={desktopPopover.chevron} />
        </Link>
      </Popover.Button>
      <Transition
        show={index === popoverOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className={desktopPopover.panel}>
          <div className={desktopPopover.panelInner}>
            {item.children.map((c, j) => (
              <NavLink key={j} href={c.href}>
                {c.title}
              </NavLink>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
