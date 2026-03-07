import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import { getQueryString } from '@/lib/operator';

import type { SelectButtonContentProps, SelectOption } from './Resources.types';
import * as styles from './Resources.styles';

export function ButtonContent({
  attribute,
  selectedValue,
  params,
  resource,
}: SelectButtonContentProps) {
  const router = useRouter();
  const d = attribute;

  if (!d.multiple || !Array.isArray(selectedValue)) {
    return (
      <span className={styles.selectTruncate}>
        {!Array.isArray(selectedValue) && selectedValue?.title}
      </span>
    );
  }

  if (selectedValue.length === 0) {
    return (
      <div className={styles.selectMultiWrap}>
        <span className={styles.selectTruncate}>Any</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(styles.selectMultiWrap, styles.selectMultiWrapSelected)}
    >
      {selectedValue.map((v: SelectOption, j: number) => (
        <div
          key={j}
          onClick={() => {
            router.push(
              `/resources/${resource}${getQueryString({
                ...params,
                [d.name]: (selectedValue as SelectOption[])
                  .filter((s: SelectOption) => s.value !== v.value)
                  .map((s: SelectOption) => s.value)
                  .join(','),
              })}`
            );
          }}
          className={styles.selectTag}
        >
          {v.title}
        </div>
      ))}
    </div>
  );
}
