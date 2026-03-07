import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { ellipse } from '@/lib/string';
import { valueBoxStyles } from './ValueBox.styles';

export function ValueBox({
  title,
  value,
  url,
  prefix = '0x',
  ellipseLength = 10,
  noEllipse = false,
  noTooltip = true,
  className = valueBoxStyles.container,
}: {
  title?: string;
  value: string;
  url?: string;
  prefix?: string;
  ellipseLength?: number;
  noEllipse?: boolean;
  noTooltip?: boolean;
  className?: string;
}) {
  const displayValue = noEllipse
    ? value
    : ellipse(value, ellipseLength, prefix);
  const element = url ? (
    <a
      href={url}
      target="_blank"
      className={clsx(
        valueBoxStyles.linkText,
        noEllipse && 'truncate'
      )}
    >
      {displayValue}
    </a>
  ) : (
    <span
      className={clsx(
        valueBoxStyles.plainText,
        noEllipse && 'truncate'
      )}
    >
      {displayValue}
    </span>
  );

  return (
    value && (
      <div className={valueBoxStyles.root}>
        <span className={valueBoxStyles.title}>{title}</span>
        <div className={clsx(className)}>
          {noEllipse && !noTooltip ? (
            <Tooltip content={displayValue}>{element}</Tooltip>
          ) : (
            element
          )}
          <Copy value={value} />
        </div>
      </div>
    )
  );
}
