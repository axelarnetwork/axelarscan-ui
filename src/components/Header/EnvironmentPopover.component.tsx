'use client';

import { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';

import { ENVIRONMENT } from '@/lib/config';

import type { EnvironmentPopoverProps } from './Header.types';
import { EnvironmentLink } from './EnvironmentLink.component';
import { environmentPopover } from './Header.styles';

export function EnvironmentPopover({ environments }: EnvironmentPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={environmentPopover.wrapper}
    >
      <Popover.Button className={environmentPopover.button}>
        <span>{ENVIRONMENT}</span>
      </Popover.Button>
      <Transition
        show={open}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className={environmentPopover.panel}>
          <div className={environmentPopover.panelInner}>
            {environments.map((d, i) => (
              <EnvironmentLink key={i} {...d}>
                {d.name}
              </EnvironmentLink>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
