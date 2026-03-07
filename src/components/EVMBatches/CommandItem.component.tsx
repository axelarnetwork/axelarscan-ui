import Link from 'next/link';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineCode } from 'react-icons/md';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { getChainData, getAssetData } from '@/lib/config';
import { split } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import { toNumber, formatUnits } from '@/lib/number';

import type { CommandItemProps } from './EVMBatches.types';
import * as styles from './EVMBatches.styles';

export function CommandItem({
  command: c,
  batch,
  chains,
  assets,
  explorerUrl: url,
  transactionPath: transaction_path,
}: CommandItemProps) {
  const { type, deposit_address } = { ...c };
  const {
    amount,
    name,
    cap,
    account,
    salt,
    newOwners,
    newOperators,
    newWeights,
    newThreshold,
    sourceChain,
    sourceTxHash,
    contractAddress,
  } = { ...c.params };
  let { symbol, decimals } = { ...c.params };

  const transferID = parseInt(c.id, 16);
  const assetData = getAssetData(symbol, assets);

  symbol =
    assetData?.addresses?.[batch.chain]?.symbol || assetData?.symbol || symbol;
  decimals =
    assetData?.addresses?.[batch.chain]?.decimals ||
    assetData?.decimals ||
    decimals ||
    18;
  const image = assetData?.addresses?.[batch.chain]?.image || assetData?.image;

  const sourceChainData = getChainData(sourceChain, chains);
  const destinationChainData = getChainData(batch.chain, chains);

  const typeElement = (
    <Tooltip content={c.executed ? 'Executed' : 'Unexecuted'}>
      <Tag
        className={clsx(
          styles.commandTypeTagBase,
          c.executed
            ? styles.commandTypeTagExecuted
            : styles.commandTypeTagUnexecuted
        )}
      >
        {type}
      </Tag>
    </Tooltip>
  );

  return (
    <div className={styles.commandRow}>
      {url && c.transactionHash ? (
        <Link
          href={`${url}${transaction_path?.replace('{tx}', c.transactionHash)}`}
          target="_blank"
        >
          {typeElement}
        </Link>
      ) : (
        typeElement
      )}
      {symbol && !['approveContractCall'].includes(type) && (
        <div className={styles.assetPill}>
          <Image src={image} alt="" width={16} height={16} />
          {amount && assets ? (
            <Number
              value={formatUnits(amount, decimals)}
              format="0,0.000000"
              suffix={` ${symbol}`}
              className={styles.assetText}
            />
          ) : (
            <span className={styles.assetText}>{symbol}</span>
          )}
        </div>
      )}
      {sourceChainData && (
        <div className={styles.sourceChainRow}>
          {sourceTxHash && (
            <Link
              href={`/gmp/${sourceTxHash}${sourceChainData.chain_type === 'cosmos' && c.id ? `?commandId=${c.id}` : ''}`}
              target="_blank"
              className={styles.gmpLink}
            >
              GMP
            </Link>
          )}
          <Tooltip
            content={sourceChainData.name}
            className={styles.chainTooltip}
          >
            <Image src={sourceChainData.image} alt="" width={20} height={20} />
          </Tooltip>
          {contractAddress && (
            <>
              <MdOutlineCode size={20} className={styles.codeIcon} />
              {destinationChainData && (
                <Tooltip
                  content={destinationChainData.name}
                  className={styles.chainTooltip}
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
                chain={batch.chain}
                width={20}
                height={20}
              />
            </>
          )}
        </div>
      )}
      {type === 'mintToken' && (
        <div className={styles.mintTransferRow}>
          <Link
            href={`/transfer?transferId=${transferID}`}
            target="_blank"
            className={styles.transferLink}
          >
            Transfer
          </Link>
          {account && (
            <>
              <MdOutlineCode size={20} className={styles.codeIcon} />
              <Profile
                address={account}
                chain={batch.chain}
                width={20}
                height={20}
              />
            </>
          )}
        </div>
      )}
      {salt && (
        <div className={styles.saltRow}>
          <span className={styles.saltLabel}>
            {deposit_address ? 'Deposit address' : 'Salt'}:
          </span>
          {deposit_address ? (
            <Copy size={16} value={deposit_address}>
              <Link
                href={`/account/${deposit_address}`}
                target="_blank"
                className={styles.saltValue}
              >
                {ellipse(deposit_address, 6, '0x')}
              </Link>
            </Copy>
          ) : (
            <Copy size={16} value={salt}>
              <span className={styles.saltValue}>{ellipse(salt, 6, '0x')}</span>
            </Copy>
          )}
        </div>
      )}
      {name && (
        <div className={styles.tokenNameWrapper}>
          <span className={styles.tokenNameText}>{name}</span>
          <div className={styles.tokenDetailRow}>
            {decimals > 0 && (
              <Number
                value={decimals}
                prefix="Decimals: "
                className={styles.tokenDetailText}
              />
            )}
            {(cap ?? 0) > 0 && (
              <Number
                value={cap}
                prefix="Cap: "
                className={styles.tokenDetailText}
              />
            )}
          </div>
        </div>
      )}
      {newOwners && (
        <Number
          value={split(newOwners, { delimiter: ';' }).length}
          suffix={' New Owners'}
          className={styles.ownersPill}
        />
      )}
      {newOperators && (
        <div className={styles.operatorsRow}>
          <Number
            value={split(newOperators, { delimiter: ';' }).length}
            suffix={' New Operators'}
            className={styles.operatorsPill}
          />
          {newWeights && (
            <Number
              value={_.sum(
                split(newWeights, { delimiter: ';' }).map((w: string) =>
                  toNumber(w)
                )
              )}
              prefix="["
              suffix="]"
              className={styles.weightsText}
            />
          )}
        </div>
      )}
      {newThreshold && (
        <Number
          value={newThreshold}
          prefix={'Threshold: '}
          className={styles.thresholdText}
        />
      )}
    </div>
  );
}
