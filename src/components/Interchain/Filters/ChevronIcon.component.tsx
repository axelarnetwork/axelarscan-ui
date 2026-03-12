import { LuChevronsUpDown } from 'react-icons/lu';

import { filterSelectInputStyles } from './FilterSelectInput.styles';

export function ChevronIcon() {
  return (
    <span className={filterSelectInputStyles.button.icon}>
      <LuChevronsUpDown
        size={20}
        className={filterSelectInputStyles.button.iconSvg}
      />
    </span>
  );
}
