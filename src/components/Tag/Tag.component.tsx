import clsx from 'clsx';

import { tagStyles } from './Tag.styles';
import type { TagProps } from './Tag.types';

export function Tag({
  children,
  className,
}: TagProps) {
  return (
    <div className={clsx(tagStyles.root, className)}>
      {children}
    </div>
  );
}
