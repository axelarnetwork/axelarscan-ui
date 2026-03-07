'use client';

import clsx from 'clsx';

import type {
  FilterOption,
  SelectButtonContentProps,
} from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function SelectButtonContent({
  attribute,
  selectedValue,
  params,
  setParams,
}: SelectButtonContentProps) {
  if (!attribute.multiple) {
    return (
      <span className={styles.selectTruncate}>
        {(selectedValue as FilterOption | undefined)?.title}
      </span>
    );
  }

  const multiValues = selectedValue as FilterOption[];
  if (multiValues.length === 0) {
    return (
      <div className={styles.selectFlexWrap}>
        <span className={styles.selectTruncate}>Any</span>
      </div>
    );
  }

  return (
    <div className={clsx(styles.selectFlexWrap, styles.selectFlexWrapMargin)}>
      {multiValues.map((v: FilterOption, j: number) => (
        <div
          key={j}
          onClick={() =>
            setParams({
              ...params,
              [attribute.name]: multiValues
                .filter((_v: FilterOption) => _v.value !== v.value)
                .map((_v: FilterOption) => _v.value)
                .join(','),
            })
          }
          className={styles.selectMultiTag}
        >
          {v.title}
        </div>
      ))}
    </div>
  );
}
