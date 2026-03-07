import clsx from 'clsx';

import { containerStyles } from './Container.styles';

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(containerStyles.root, className)} {...props} />
  );
}
