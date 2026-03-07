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

import {
  mobileNavLink,
  mobileNavIcon,
  mobileNavigation,
  environmentLink,
  header,
  desktopPopover,
  environmentPopover,
} from './Header.styles';

const NAVIGATIONS = [
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
  ENVIRONMENT === 'mainnet' && { title: 'TVL', href: '/tvl' },
  {
    title: 'Resources',
    children: [
      { title: 'Chains', href: '/resources/chains' },
      { title: 'Assets', href: '/resources/assets' },
    ],
  },
].filter(Boolean) as { title: string; href?: string; children?: { title: string; href: string }[] }[];

const ENVIRONMENTS = [
  { name: 'mainnet', href: 'https://axelarscan.io' },
  { name: 'testnet', href: 'https://testnet.axelarscan.io' },
  { name: 'stagenet', href: 'https://stagenet.axelarscan.io' },
  { name: 'devnet-amplifier', href: 'https://devnet-amplifier.axelarscan.io' },
].filter(
  d =>
    !['stagenet', 'devnet-amplifier'].includes(d.name) || d.name === ENVIRONMENT
);

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

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

interface MobileNavIconProps {
  open: boolean;
}

function MobileNavIcon({ open }: MobileNavIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={mobileNavIcon.svg}
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          mobileNavIcon.pathTransition,
          open && mobileNavIcon.pathHidden
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          mobileNavIcon.pathTransition,
          !open && mobileNavIcon.pathHidden
        )}
      />
    </svg>
  );
}

function MobileNavigation() {
  return (
    <Popover>
      <Popover.Button
        className={mobileNavigation.button}
        aria-label="Toggle Navigation"
      >
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
            {NAVIGATIONS.map(({ title, href, children }, i) => {
              if (children) {
                return (
                  <div key={i} className={mobileNavigation.group}>
                    <span className={mobileNavigation.groupTitle}>{title}</span>
                    {children.map((c: { title: string; href: string }, j: number) => (
                      <MobileNavLink key={j} href={c.href}>
                        {c.title}
                      </MobileNavLink>
                    ))}
                  </div>
                );
              }

              return (
                href && (
                  <MobileNavLink
                    key={i}
                    href={href}
                    className={mobileNavigation.topLevelLink}
                  >
                    {title}
                  </MobileNavLink>
                )
              );
            })}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  );
}

interface EnvironmentLinkProps {
  name: string;
  href: string;
  children: React.ReactNode;
}

function EnvironmentLink({ name, href, children }: EnvironmentLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        environmentLink.base,
        name === ENVIRONMENT
          ? environmentLink.active
          : environmentLink.inactive
      )}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState<number | null>(null);
  const [popoverEnvironmentOpen, setPopoverEnvironmentOpen] = useState(false);
  const tvl = useTVL();

  const hasTVL = pathname === '/tvl' && !!tvl;

  return (
    <header
      className={clsx(header.root, hasTVL && header.tvlWidth)}
    >
      <Container className={clsx(hasTVL && header.containerTvl)}>
        <nav className={header.nav}>
          <div className={header.leftGroup}>
            <Link href="/" aria-label="Dashboard">
              <Logo className={header.logoLink} />
            </Link>
            <div className={header.desktopNavContainer}>
              {NAVIGATIONS.map(({ title, href, children }, i) => {
                if (children) {
                  return (
                    <Popover
                      key={i}
                      onMouseEnter={() => setPopoverOpen(i)}
                      onMouseLeave={() => setPopoverOpen(null)}
                      className={desktopPopover.wrapper}
                    >
                      <Popover.Button
                        className={clsx(
                          desktopPopover.button,
                          href === pathname ||
                            children.find((c: { title: string; href: string }) => c.href === pathname)
                            ? desktopPopover.buttonActive
                            : desktopPopover.buttonInactive
                        )}
                      >
                        <Link
                          href={children[0].href}
                          className={desktopPopover.linkInner}
                        >
                          <span>{title}</span>
                          <FiChevronDown className={desktopPopover.chevron} />
                        </Link>
                      </Popover.Button>
                      <Transition
                        show={i === popoverOpen}
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
                            {children.map((c: { title: string; href: string }, j: number) => (
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

                return (
                  href && (
                    <NavLink key={i} href={href}>
                      <div className={desktopPopover.topLevelInner}>{title}</div>
                    </NavLink>
                  )
                );
              })}
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
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}
