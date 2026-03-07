import { ReactNode } from 'react';
import clsx from 'clsx';

import { infoStyles } from './Info.styles';

interface SectionProps {
  label?: ReactNode;
  children: ReactNode;
  wrapperClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function Section({
  label,
  children,
  wrapperClassName,
  valueClassName,
  labelClassName,
}: SectionProps) {
  return (
    <div className={clsx(infoStyles.section, wrapperClassName)}>
      {label !== undefined && (
        <dt className={clsx(infoStyles.label, labelClassName)}>{label}</dt>
      )}
      <dd className={clsx(infoStyles.value, valueClassName)}>{children}</dd>
    </div>
  );
}
