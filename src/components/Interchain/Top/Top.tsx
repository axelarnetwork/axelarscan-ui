import { useGlobalStore } from '@/components/Global';
import { Spinner } from '@/components/Spinner';
import { getChainData } from '@/lib/config';
import { split, toArray } from '@/lib/parser';
import { GroupDataItem, InterchainData } from '../Interchain.types';
import { topStyles } from './Top.styles';
import { TopProps } from './Top.types';
import { TopItem } from './TopItem';

export function Top({
  index,
  data,
  type = 'chain',
  hasTransfers = true,
  hasGMP = true,
  transfersType,
  field = 'num_txs',
  title = '',
  description = '',
  format: _format = '0,0.00a',
  prefix = '',
  className,
}: TopProps) {
  const { chains } = useGlobalStore();

  // Handle union type - cast to the appropriate type
  const dataArray = (Array.isArray(data) ? data : toArray(data)) as (
    | InterchainData
    | GroupDataItem
  )[];

  return (
    <div className={topStyles.container(type, index, hasTransfers, hasGMP)}>
      <div className={topStyles.header.container}>
        <span className={topStyles.header.title}>{title}</span>
        {description && (
          <span className={topStyles.header.description}>{description}</span>
        )}
      </div>
      <div className={topStyles.content.container}>
        {!data ? (
          <div className={topStyles.content.loading}>
            <Spinner />
          </div>
        ) : (
          <div className={topStyles.content.list(className)}>
            {dataArray
              .filter(
                dataItem =>
                  (type !== 'chain' ||
                    split((dataItem as Record<string, unknown>).key as string, {
                      delimiter: '_',
                    }).filter(keyPart => !getChainData(keyPart, chains))
                      .length < 1) &&
                  ((dataItem as Record<string, unknown>)[field] as number) > 0
              )
              .map((dataItem, itemIndex) => (
                <TopItem
                  key={itemIndex}
                  data={dataItem as Record<string, unknown>}
                  type={type}
                  field={field}
                  format={_format}
                  prefix={prefix}
                  transfersType={transfersType}
                  chains={chains}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
