'use client';

import { useEffect, useState } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import clsx from 'clsx';

import { switchStyles } from './Switch.styles';

export function Switch({
  value,
  onChange,
  title,
  groupClassName,
  outerClassName,
  innerClassName,
  labelClassName,
  titleClassName,
}: {
  value: boolean;
  onChange?: (enabled: boolean) => void;
  title?: string;
  groupClassName?: string;
  outerClassName?: string;
  innerClassName?: string;
  labelClassName?: string;
  titleClassName?: string;
}) {
  const [enabled, setEnabled] = useState(value);

  useEffect(() => {
    setEnabled(value);
  }, [value, setEnabled]);

  useEffect(() => {
    if (onChange) {
      onChange(enabled);
    }
  }, [onChange, enabled]);

  return (
    <HeadlessSwitch.Group
      as="div"
      className={clsx(switchStyles.group, groupClassName)}
    >
      <HeadlessSwitch
        checked={enabled}
        onChange={setEnabled}
        className={clsx(
          switchStyles.outer,
          enabled ? switchStyles.outerEnabled : switchStyles.outerDisabled,
          outerClassName
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            switchStyles.inner,
            enabled ? switchStyles.innerEnabled : switchStyles.innerDisabled,
            innerClassName
          )}
        />
      </HeadlessSwitch>
      {title && (
        <HeadlessSwitch.Label
          as="span"
          className={clsx(switchStyles.label, labelClassName)}
        >
          <span className={clsx(switchStyles.title, titleClassName)}>
            {title}
          </span>
        </HeadlessSwitch.Label>
      )}
    </HeadlessSwitch.Group>
  );
}
