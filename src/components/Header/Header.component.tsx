'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { FiChevronDown } from 'react-icons/fi';

import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { NavLink } from '@/components/NavLink';
import { Search } from '@/components/Search';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTVL } from '@/hooks/useGlobalData';
import { ENVIRONMENT } from '@/lib/config';

import type { NavigationItem, EnvironmentItem, EnvironmentLinkProps } from './Header.types';
import { MobileNavigation } from './MobileNavigation.component';
import { header, desktopPopover, environmentPopover, environmentLink } from './Header.styles';

const NAVIGATIONS: NavigationItem[] = [
  {
    title: 'Interchain',
    children: [
      { title: 'Statistics', href: '/interchain' },
      { title: 'General Message Passing', href: '/gmp/search' },
    ],
  },
  {
    title: 'Network',
    children: [
      { title: 'Validators', href: '/validators' },
      { title: 'Verifiers', href: '/verifiers' },
      { title: 'Amplifier Rewards', href: '/amplifier-rewards' },
      { title: 'Blocks', href: '/blocks' },
      { title: 'Transactions', href: '/transactions' },
      { title: 'External Chain Polls', href: '/evm-polls' },
      { title: 'External Chain Signings', href: '/evm-batches' },
      { title: 'Proposals', href: '/proposals' },
    ],
  },
  ...(ENVIRONMENT === 'mainnet' ? [{ title: 'TVL', href: '/tvl' }] : []),
  {
    title: 'Resources',
    children: [
      { title: 'Chains', href: '/resources/chains' },
      { title: 'Assets', href: '/resources/assets' },
    ],
  },
];

const ENVIRONMENTS: EnvironmentItem[] = [
  { name: 'mainnet', href: 'https://axelarscan.io' },
  { name: 'testnet', href: 'https://testnet.axelarscan.io' },
  { name: 'stagenet', href: 'https://stagenet.axelarscan.io' },
  { name: 'devnet-amplifier', href: 'https://devnet-amplifier.axelarscan.io' },
].filter(
  d => !['stagenet', 'devnet-amplifier'].includes(d.name) || d.name === ENVIRONMENT
);

function EnvironmentLink({ name, href, children }: EnvironmentLinkProps) {
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

function DesktopNavItem({ item, index, popoverOpen, setPopoverOpen }: {
  item: NavigationItem;
  index: number;
  popoverOpen: number | null;
  setPopoverOpen: (i: number | null) => void;
}) {
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

export function Header() {
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
  const [popoverEnvironmentOpen, setPopoverEnvironmentOpen] = useState(false);
  const tvl = useTVL();

  const hasTVL = pathname === '/tvl' && !!tvl;

  return (
    <header className={clsx(header.root, hasTVL && header.tvlWidth)}>
      <Container className={clsx(hasTVL && header.containerTvl)}>
        <nav className={header.nav}>
          <div className={header.leftGroup}>
            <Link href="/" aria-label="Dashboard">
              <Logo className={header.logoLink} />
            </Link>
            <div className={header.desktopNavContainer}>
              {NAVIGATIONS.map((item, i) => (
                <DesktopNavItem
                  key={i}
                  item={item}
                  index={i}
                  popoverOpen={popoverOpen}
                  setPopoverOpen={setPopoverOpen}
                />
              ))}
            </div>
          </div>
          <div className={header.rightGroup}>
            <div className={header.searchWrapper}>
              <Search />
            </div>
            <div className={header.environmentWrapper}>
              <Popover
                onMouseEnter={() => setPopoverEnvironmentOpen(true)}
                onMouseLeave={() => setPopoverEnvironmentOpen(false)}
                className={environmentPopover.wrapper}
              >
                <Popover.Button className={environmentPopover.button}>
                  <span>{ENVIRONMENT}</span>
                </Popover.Button>
                <Transition
                  show={popoverEnvironmentOpen}
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className={environmentPopover.panel}>
                    <div className={environmentPopover.panelInner}>
                      {ENVIRONMENTS.map((d, i) => (
                        <EnvironmentLink key={i} {...d}>
                          {d.name}
                        </EnvironmentLink>
                      ))}
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            </div>
            <ThemeToggle />
            <div className={header.mobileNavWrapper}>
              <MobileNavigation navigations={NAVIGATIONS} />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
