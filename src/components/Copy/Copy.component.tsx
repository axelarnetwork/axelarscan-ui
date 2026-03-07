'use client';

import { isValidElement, useEffect, useState } from 'react';
// @ts-expect-error — no type declarations available
import { CopyToClipboard } from 'react-copy-to-clipboard';
import clsx from 'clsx';
import { LuClipboard, LuClipboardCheck } from 'react-icons/lu';

import { copyStyles } from './Copy.styles';
import type { CopyProps } from './Copy.types';

export function Copy({
  size = 18,
  value,
  onCopy,
  children,
  childrenClassName,
  className,
}: CopyProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timeout = copied
      ? setTimeout(() => setCopied(false), 1 * 1000)
      : undefined;
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = () => {
    setCopied(true);
    if (onCopy) {
      onCopy();
    }
  };

  if (copied) {
    return (
      <div
        className={clsx(
          copyStyles.wrapper,
          children && 'min-w-max',
          childrenClassName
        )}
      >
        {children}
        <LuClipboardCheck
          size={size}
          className={clsx(copyStyles.checkIcon, className)}
        />
      </div>
    );
  }

  if (isValidElement(children) && children.props && (children.props as Record<string, unknown>).href) {
    return (
      <div
        className={clsx(copyStyles.wrapperWithChildren, childrenClassName)}
      >
        {children}
        <CopyToClipboard text={value} onCopy={() => handleCopy()}>
          <LuClipboard
            size={size}
            className={clsx(copyStyles.clipboardIcon, className)}
          />
        </CopyToClipboard>
      </div>
    );
  }

  return (
    <CopyToClipboard text={value} onCopy={() => handleCopy()}>
      <div
        className={clsx(
          copyStyles.wrapper,
          children && 'min-w-max',
          childrenClassName
        )}
      >
        {children}
        <LuClipboard
          size={size}
          className={clsx(copyStyles.clipboardIcon, className)}
        />
      </div>
    </CopyToClipboard>
  );
}
