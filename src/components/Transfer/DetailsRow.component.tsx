import Link from 'next/link';
import clsx from 'clsx';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { TimeAgo } from '@/components/Time';
import { ExplorerLink } from '@/components/ExplorerLink';
import { ellipse } from '@/lib/string';
import { resolveBlockURL } from './Transfer.utils';
import type { DetailsRowProps } from './Transfer.types';
import * as styles from './Transfer.styles';

export function DetailsRow({
  step,
  stepTX,
  stepURL,
  stepMoreInfos,
  axelarChainData,
}: DetailsRowProps) {
  const stepData = step.data;
  const height = stepData?.height;
  const blockNumber = stepData?.blockNumber;
  const block_timestamp = stepData?.block_timestamp;
  const received_at = stepData?.received_at;
  const created_at = stepData?.created_at;
  const { url, block_path } = { ...step.chainData?.explorer };

  const blockValue = height ?? blockNumber;

  return (
    <tr className={styles.detailsTr}>
      <td className={styles.detailsTdStep}>
        <span className={styles.detailsTdStepText}>
          {step.title}
        </span>
      </td>
      <td className={styles.detailsTdDefault}>
        <div className={styles.detailsTxFlexCol}>
          {stepTX && (
            <div className={styles.detailsTxRow}>
              <Copy value={stepTX}>
                <Link
                  href={stepURL!}
                  target="_blank"
                  className={styles.detailsTxLink}
                >
                  {ellipse(stepTX)}
                </Link>
              </Copy>
              <ExplorerLink
                value={stepTX}
                chain={step.chainData?.id}
                customURL={stepURL}
              />
            </div>
          )}
          {stepMoreInfos.length > 0 && (
            <div className={styles.detailsMoreInfos}>
              {stepMoreInfos}
            </div>
          )}
        </div>
      </td>
      <td className={styles.detailsTdDefault}>
        {blockValue &&
          (url && block_path ? (
            <Link
              href={resolveBlockURL(step, blockValue, axelarChainData)}
              target="_blank"
              className={styles.detailsTxLink}
            >
              <Number value={blockValue} />
            </Link>
          ) : (
            <Number value={blockValue} />
          ))}
      </td>
      <td className={styles.detailsTdDefault}>
        {step.status && (
          <Tag
            className={clsx(
              styles.tagFitCapitalize,
              styles.getStatusTagClass(step.status)
            )}
          >
            {step.status}
          </Tag>
        )}
      </td>
      <td className={styles.detailsTdTime}>
        <TimeAgo
          timestamp={
            (block_timestamp && block_timestamp * 1000) ||
            received_at?.ms ||
            created_at?.ms
          }
        />
      </td>
    </tr>
  );
}
