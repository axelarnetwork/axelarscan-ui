'use client';

import { Fragment } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Listbox, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { MdCheck } from 'react-icons/md';
import { LuChevronsUpDown } from 'react-icons/lu';

import type { Chain } from '@/types';
import { useChains } from '@/hooks/useGlobalData';
import { equalsIgnoreCase } from '@/lib/string';
import { toArray } from '@/lib/parser';

import * as styles from './AmplifierRewards.styles';

interface ChainSelectorProps {
  chain: string;
  chainId: string | undefined;
}

export function ChainSelector({ chain, chainId }: ChainSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const chains = useChains();

  const vmChains = toArray(chains).filter((d: Chain) => d.chain_type === 'vm');
  const isSelected = (v: string) => v === chainId || equalsIgnoreCase(v, chain);
  const selectedValue = toArray(chains).find((d: Chain) => isSelected(d.id)) as Chain | undefined;

  return (
    <Listbox
      value={chainId}
      onChange={(v: string) => router.push(`${pathname.replace(chain, v)}`)}
      {...({ className: styles.listboxWrapper } as Record<string, string>)}
    >
      {({ open }) => (
        <div className={styles.listboxRelative}>
          <Listbox.Button className={styles.listboxButton}>
            <span className={styles.listboxButtonText}>
              {selectedValue?.name}
            </span>
            <span className={styles.listboxButtonIcon}>
              <LuChevronsUpDown size={20} className={styles.listboxChevronIcon} />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className={styles.listboxOptions}>
              {vmChains.map((d: Chain, j: number) => (
                <Listbox.Option
                  key={j}
                  value={d.id}
                  className={({ active }: { active: boolean }) =>
                    clsx(
                      styles.listboxOptionBase,
                      active ? styles.listboxOptionActive : styles.listboxOptionInactive
                    )
                  }
                >
                  {({ selected, active }: { selected: boolean; active: boolean }) => (
                    <>
                      <span
                        className={clsx(
                          styles.listboxButtonText,
                          selected ? styles.listboxOptionTextSelected : styles.listboxOptionTextNormal
                        )}
                      >
                        {d.name}
                      </span>
                      {selected && (
                        <span
                          className={clsx(
                            styles.listboxCheckWrapper,
                            active ? styles.listboxCheckActive : styles.listboxCheckInactive
                          )}
                        >
                          <MdCheck size={20} />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
