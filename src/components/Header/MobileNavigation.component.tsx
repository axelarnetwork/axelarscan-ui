'use client';

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';

import type { NavigationItem } from './Header.types';
import { MobileNavIcon, NavigationGroup } from './MobileNavHelpers.component';
import { mobileNavigation } from './Header.styles';

export function MobileNavigation({ navigations }: { navigations: NavigationItem[] }) {
  return (
    <Popover>
      <Popover.Button className={mobileNavigation.button} aria-label="Toggle Navigation">
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className={mobileNavigation.overlay} />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel as="div" className={mobileNavigation.panel}>
            {navigations.map((item, i) => (
              <NavigationGroup key={i} item={item} />
            ))}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  );
}
