import { useRouter } from 'next/navigation';

import { getQueryString } from '@/lib/operator';

import type { FilterAttribute, AttributeFiltersProps } from './Resources.types';
import { FilterSelect } from './FilterSelect.component';
import * as styles from './Resources.styles';

export function AttributeFilters({
  attributes,
  params,
  resource,
}: AttributeFiltersProps) {
  const router = useRouter();

  return (
    <div className={styles.attributesWrapper}>
      {attributes.map((d: FilterAttribute, i: number) => (
        <div key={i} className={styles.attributeRow}>
          <label htmlFor={d.name} className={styles.attributeLabel}>
            {d.label}
          </label>
          <div className={styles.attributeFieldWrapper}>
            {d.type === 'select' ? (
              <FilterSelect attribute={d} params={params} resource={resource} />
            ) : (
              <input
                type={d.type || 'text'}
                name={d.name}
                placeholder={d.label}
                value={params[d.name]}
                onChange={e => {
                  router.push(
                    `/resources/${getQueryString({ ...params, [d.name]: e.target.value })}`
                  );
                }}
                className={styles.filterInput}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
