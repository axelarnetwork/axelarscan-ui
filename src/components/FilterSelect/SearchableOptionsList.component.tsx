'use client';

import { Combobox } from '@headlessui/react';
import clsx from 'clsx';

import type { SearchableOptionsListProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';
import { OptionContent } from './OptionContent.component';

export function SearchableOptionsList({ options }: SearchableOptionsListProps) {
  return (
    <>
      {options.map((o, j) => (
        <Combobox.Option
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
        </Combobox.Option>
      ))}
    </>
  );
}
