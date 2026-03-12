import { Copy } from '@/components/Copy';

import { contractCallDataStyles } from './ContractCallData.styles';
import type { DataFieldProps } from './ContractCallData.types';

export function DataField({ label, value, textClassName }: DataFieldProps) {
  const textClass = textClassName ?? contractCallDataStyles.copyText;

  return (
    <div className={contractCallDataStyles.section}>
      <dt className={contractCallDataStyles.label}>{label}</dt>
      <dd className={contractCallDataStyles.value}>
        <Copy
          size={16}
          value={value}
          childrenClassName={contractCallDataStyles.copyWrapper}
          className={contractCallDataStyles.copyButton}
        >
          <span className={textClass}>{value}</span>
        </Copy>
      </dd>
    </div>
  );
}
