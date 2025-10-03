'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function NavLink({ href, children }) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={clsx(
        'inline-block w-full whitespace-nowrap rounded-lg p-2 text-sm hover:text-blue-600 dark:hover:text-blue-500',
        href === pathname
          ? 'text-blue-600 dark:text-blue-500'
          : 'text-zinc-700 dark:text-zinc-300'
      )}
    >
      {children}
    </Link>
  );
}
