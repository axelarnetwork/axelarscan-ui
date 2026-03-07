'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { Search } from '@/components/Search';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTVL } from '@/hooks/useGlobalData';
import { ENVIRONMENT } from '@/lib/config';

import type { NavigationItem, EnvironmentItem } from './Header.types';
import { MobileNavigation } from './MobileNavigation.component';
import { DesktopNavItem } from './DesktopNav.component';
import { EnvironmentPopover } from './EnvironmentPopover.component';
import { header } from './Header.styles';

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

export function Header() {
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
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
              <EnvironmentPopover environments={ENVIRONMENTS} />
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
