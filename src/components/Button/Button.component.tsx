'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { toBoolean } from '@/lib/string';
import { buttonBaseStyles, buttonVariantStyles } from './Button.styles';
import type { ButtonProps } from './Button.types';

export function Button({ className, ...props }: ButtonProps) {
  props.variant ??= 'solid';
  props.color ??= 'zinc';

  className = clsx(
    buttonBaseStyles[props.variant as keyof typeof buttonBaseStyles],
    props.variant === 'outline' &&
      buttonVariantStyles.outline[
        props.color as keyof typeof buttonVariantStyles.outline
      ],
    props.variant === 'solid' &&
      buttonVariantStyles.solid[
        props.color as keyof typeof buttonVariantStyles.solid
      ],
    toBoolean(props.circle, false) && '!p-2',
    className
  );

  const { variant: _, color: _c, circle: _ci, ...rest } = props;

  if (typeof props.href === 'undefined') {
    return <button className={className} {...rest as React.ButtonHTMLAttributes<HTMLButtonElement>} />;
  }

  return <Link className={className} {...rest as React.ComponentProps<typeof Link>} />;
}
