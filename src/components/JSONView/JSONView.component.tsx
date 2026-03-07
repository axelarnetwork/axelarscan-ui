'use client';

import { useTheme } from 'next-themes';
import ReactJSONView from 'react18-json-view';
import clsx from 'clsx';

import { toJson } from '@/lib/parser';
import { jsonViewStyles } from './JSONView.styles';

import 'react18-json-view/src/style.css';

export function JSONView({
  value,
  tab = 4,
  useJSONView = true,
  className,
}: {
  value: unknown;
  tab?: number;
  useJSONView?: boolean;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    typeof toJson(value) === 'object' && (
      <div className={clsx(jsonViewStyles.root, className)}>
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
