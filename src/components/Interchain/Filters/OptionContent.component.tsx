'use client';

import { MdCheck } from 'react-icons/md';

import type { InterchainOptionContentProps } from '../Interchain.types';
import { filterSelectInputStyles } from './FilterSelectInput.styles';

export function OptionContent({
  selected,
  active,
  title,
}: InterchainOptionContentProps) {
  return (
    <>
      <span className={filterSelectInputStyles.options.optionText(selected)}>
        {title}
      </span>
      {selected && (
        <span className={filterSelectInputStyles.options.checkIcon(active)}>
          <MdCheck size={20} />
        </span>
      )}
    </>
  );
}
