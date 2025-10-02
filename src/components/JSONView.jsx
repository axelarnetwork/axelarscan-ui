'use client';

import { useTheme } from 'next-themes';
import ReactJSONView from 'react18-json-view';
import clsx from 'clsx';

import { toJson } from '@/lib/parser';

import 'react18-json-view/src/style.css';

export function JSONView({ value, tab = 4, useJSONView = true, className }) {
  const { resolvedTheme } = useTheme();

  return (
    typeof toJson(value) === 'object' && (
      <div
        className={clsx(
          'max-h-96 max-w-xs overflow-y-auto whitespace-pre text-sm text-zinc-900 dark:text-zinc-100 sm:max-w-4xl',
          className
        )}
      >
        {useJSONView ? (
          <ReactJSONView
            src={toJson(value)}
            dark={resolvedTheme === 'dark'}
            theme="winter-is-coming"
          />
        ) : (
          JSON.stringify(toJson(value), null, tab)
        )}
      </div>
    )
  );
}
