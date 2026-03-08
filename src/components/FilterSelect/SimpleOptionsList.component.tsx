'use client';

import { Listbox } from '@headlessui/react';
import clsx from 'clsx';

import type { SimpleOptionsListProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { OptionContent } from './OptionContent.component';

export function SimpleOptionsList({ options }: SimpleOptionsListProps) {
  return (
    <>
      {options.map((o, j) => (
        <Listbox.Option
          key={j}
          value={o.value}
          className={({ active }: { active: boolean }) =>
            clsx(
              styles.selectOptionBase,
              active ? styles.selectOptionActive : styles.selectOptionInactive
            )
          }
        >
          {({ selected, active }: { selected: boolean; active: boolean }) => (
            <OptionContent
              selected={selected}
              active={active}
              title={o.title}
            />
          )}
        </Listbox.Option>
      ))}
    </>
  );
}
