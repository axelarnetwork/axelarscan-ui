import Link from 'next/link';
import { MdOutlineCode } from 'react-icons/md';

import { Image } from '@/components/Image';
import { Profile } from '@/components/Profile';
import { Tooltip } from '@/components/Tooltip';

import type { SourceChainInfoProps } from './EVMBatch.types';
import * as styles from './EVMBatch.styles';

export function SourceChainInfo({
  sourceChainData,
  sourceTxHash,
  commandId,
  contractAddress,
  destinationChainData,
  chain,
}: SourceChainInfoProps) {
  return (
    <div className={styles.sourceChainWrapper}>
      {sourceTxHash && (
        <Link
          href={`/gmp/${sourceTxHash}${sourceChainData!.chain_type === 'cosmos' && commandId ? `?commandId=${commandId}` : ''}`}
          target="_blank"
          className={styles.linkBlueMedium}
        >
          GMP
        </Link>
      )}
      <Tooltip content={sourceChainData!.name} className={styles.tooltipNoWrap}>
        <Image src={sourceChainData!.image} alt="" width={20} height={20} />
      </Tooltip>
      {contractAddress && (
        <>
          <MdOutlineCode size={20} className={styles.codeIcon} />
          {destinationChainData && (
            <Tooltip
              content={destinationChainData.name}
              className={styles.tooltipNoWrap}
            >
              <Image
                src={destinationChainData.image}
                alt=""
                width={20}
                height={20}
              />
            </Tooltip>
          )}
          <Profile
            address={contractAddress}
            chain={chain}
            width={20}
            height={20}
          />
        </>
      )}
    </div>
  );
}
