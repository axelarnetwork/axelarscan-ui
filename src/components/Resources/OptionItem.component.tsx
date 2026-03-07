import { Listbox } from '@headlessui/react';
import clsx from 'clsx';
import { MdCheck } from 'react-icons/md';

import type { SelectOptionItemProps } from './Resources.types';
import * as styles from './Resources.styles';

export function OptionItem({ option }: SelectOptionItemProps) {
  return (
    <Listbox.Option
      value={option.value}
      className={({ active }) =>
        clsx(
          styles.selectOptionBase,
          active ? styles.selectOptionActive : styles.selectOptionInactive
        )
      }
    >
      {({ selected, active }) => (
        <>
          <span
            className={clsx(
              styles.selectTruncate,
              selected
                ? styles.selectOptionTextSelected
                : styles.selectOptionTextNormal
            )}
          >
            {option.title}
          </span>
          {selected && (
            <span
              className={clsx(
                styles.selectCheckWrapper,
                active ? styles.selectCheckActive : styles.selectCheckInactive
              )}
            >
              <MdCheck size={20} />
            </span>
          )}
        </>
      )}
    </Listbox.Option>
  );
}
