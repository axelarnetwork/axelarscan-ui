import clsx from 'clsx';

import { ContractCallData } from '../ContractCallData';
import { GMPMessage } from '../GMP.types';
import { infoStyles } from './Info.styles';
import type { InfoContractCallDetailsProps } from './Info.types';

export function InfoContractCallDetails({
  data,
  executeData,
  isMultihop,
}: InfoContractCallDetailsProps) {
  const items = [data, data.callbackData].filter(
    (d): d is GMPMessage => d !== undefined && typeof d === 'object'
  );

  return (
    <div
      className={clsx(
        infoStyles.detailsGrid,
        data.callbackData && infoStyles.detailsGridTwoCols
      )}
    >
      {items.map((d, i) => (
        <ContractCallData
          key={i}
          data={d}
          executeData={i === 0 && executeData ? executeData : undefined}
          isMultihop={isMultihop}
        />
      ))}
    </div>
  );
}
