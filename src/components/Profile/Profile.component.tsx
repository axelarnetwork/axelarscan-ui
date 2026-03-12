'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { ellipse } from '@/lib/string';

import type { ProfileProps } from './Profile.types';
import { useProfileData } from './Profile.hooks';
import { getAddressPagePath, randImage } from './Profile.utils';
import { EVMProfile } from './EVMProfile.component';
import { profile as styles } from './Profile.styles';

export function Profile({
  address: addressProp,
  chain: chainProp,
  prefix: prefixProp = 'axelar',
  width = 24,
  height = 24,
  noResolveName = false,
  noCopy = false,
  customURL,
  useContractLink,
  className,
}: ProfileProps) {
  const data = useProfileData({
    address: addressProp,
    chain: chainProp,
    prefix: prefixProp,
    width,
    customURL,
    useContractLink,
  });

  if (!data) return null;

  const {
    address,
    chain,
    prefix,
    name,
    image,
    isValidator,
    isVerifier,
    url,
    copySize,
  } = data;

  if (name) {
    return (
      <div
        className={clsx(
          styles.wrapperWithName,
          width < 24 ? styles.gapSmall : styles.gapDefault,
          className
        )}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={width}
            height={height}
            className={clsx(
              styles.imageRoundedFull,
              width === 24 && styles.imageSizeDefault
            )}
          />
        ) : (
          isValidator && (
            <Image
              src={randImage(address)}
              alt=""
              width={width}
              height={height}
              className={clsx(
                styles.imageRoundedFull,
                width === 24 && styles.imageSizeDefault
              )}
            />
          )
        )}
        <div className={clsx(styles.linkWrapper, className)}>
          <Link
            href={url || getAddressPagePath(address, prefix, isVerifier)}
            target="_blank"
            className={styles.linkText}
          >
            {ellipse(name, isValidator ? 10 : 16)}
          </Link>
          {!noCopy && <Copy size={copySize} value={address} />}
        </div>
      </div>
    );
  }

  if (address.startsWith('0x') && !noResolveName) {
    return (
      <EVMProfile
        address={address}
        chain={chain}
        url={url}
        width={width}
        height={height}
        noCopy={noCopy}
        className={className}
      />
    );
  }

  if (url) {
    return (
      <div className={clsx(styles.linkWrapper, className)}>
        <Link href={url} target="_blank" className={styles.linkText}>
          {ellipse(address, 4, prefix)}
        </Link>
        {!noCopy && <Copy size={copySize} value={address} />}
      </div>
    );
  }

  return (
    <Copy size={copySize} value={address}>
      <span className={clsx(className)}>{ellipse(address, 4, prefix)}</span>
    </Copy>
  );
}
