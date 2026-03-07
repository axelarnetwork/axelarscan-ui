import clsx from 'clsx';

import { tagStyles } from './Tag.styles';

export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(tagStyles.root, className)}>
      {children}
    </div>
  );
}
