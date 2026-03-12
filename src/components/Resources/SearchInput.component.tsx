import { split } from '@/lib/parser';

import type { SearchInputProps } from './Resources.types';
import * as styles from './Resources.styles';

export function SearchInput({ resource, input, setInput }: SearchInputProps) {
  return (
    <input
      placeholder={`Search by ${resource === 'assets' ? 'Denom / Symbol / Address' : 'Chain Name / ID'}`}
      value={input}
      onChange={e =>
        setInput(
          split(e.target.value, {
            delimiter: ' ',
            filterBlank: false,
          }).join(' ')
        )
      }
      className={styles.searchInput}
    />
  );
}
