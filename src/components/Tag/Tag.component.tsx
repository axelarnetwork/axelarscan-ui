import { twMerge } from 'tailwind-merge';

import { tagStyles } from './Tag.styles';
import type { TagProps } from './Tag.types';

export function Tag({ children, className }: TagProps) {
  return <div className={twMerge(tagStyles.root, className)}>{children}</div>;
}
