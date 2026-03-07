'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { getENS } from '@/lib/api/name-services/ens';
import { getSpaceID } from '@/lib/api/name-services/spaceid';
import { toCase, toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import ENSLogo from '@/images/name-services/ens.png';
import SpaceIDLogo from '@/images/name-services/spaceid.png';

import type { SpaceIDProfileProps, ENSProfileProps, EVMProfileProps, NameServiceEntry } from './Profile.types';
import { useNameServicesStore } from './Profile.stores';
import { nameService as styles } from './Profile.styles';

function setDefaultData(addresses: string[], data: Record<string, NameServiceEntry> | null) {
  let result = { ...data };
  addresses.forEach(a => {
    if (!result[a]) {
      result = { ...result, [a]: {} };
    }
  });
  return result;
}

function NameServiceImage({ src, fallbackSrc, width, height, onLoad }: {
  src: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallbackSrc: any;
  width: number;
  height: number;
  onLoad?: () => void;
}) {
  const [image404, setImage404] = useState<boolean | null>(null);
  const sizeClass = width === 24 ? styles.imageSizeDefault : styles.imageSizeSmall;
  const marginClass = width < 24 ? styles.imageMarginSmall : styles.imageMarginDefault;

  if (typeof image404 === 'boolean') {
    return (
      <Image
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        src={(image404 ? fallbackSrc : src) as any}
        alt=""
        width={width}
        height={height}
        className={clsx(styles.imageRoundedFull, width === 24 && styles.imageSizeDefault, marginClass)}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      onLoad={() => { setImage404(false); onLoad?.(); }}
      onError={() => setImage404(true)}
      className={clsx(styles.imageRoundedFull, sizeClass, marginClass)}
    />
  );
}

function NameServiceContent({ url, noCopy, address, width, className, element }: {
  url?: string;
  noCopy: boolean;
  address: string;
  width: number;
  className?: string;
  element: React.ReactNode;
}) {
  const copySize = width < 24 ? 16 : 18;

  if (url) {
    return (
      <div className={clsx(styles.linkWrapper, className)}>
        <Link href={url} target="_blank" className={styles.linkText}>
          {element}
        </Link>
        {!noCopy && <Copy size={copySize} value={address} />}
      </div>
    );
  }

  if (noCopy) return <>{element}</>;

  return (
    <Copy size={copySize} value={address}>
      <span className={clsx(className)}>{element}</span>
    </Copy>
  );
}

export function ENSProfile({
  address,
  url,
  width = 24,
  height = 24,
  noCopy = false,
  origin: _origin,
  className,
}: ENSProfileProps) {
  const { ens, setENS } = useNameServicesStore();

  useEffect(() => {
    const getData = async () => {
      if (!address) return;
      const addresses = toArray(address, { toCase: 'lower' }).filter((a: string) => !ens?.[a]);
      if (addresses.length === 0) return;

      let data = setDefaultData(addresses, ens);
      setENS({ ...data });
      data = setDefaultData(addresses, await getENS(addresses) as Record<string, NameServiceEntry> | null);
      setENS({ ...data });
    };

    getData();
  }, [address, ens, setENS]);

  const { name } = { ...ens?.[toCase(address, 'lower')] };
  const src = `https://metadata.ens.domains/mainnet/avatar/${name}`;

  const element = name ? (
    <span title={name} className={clsx(styles.nameText, className)}>{ellipse(name, 16)}</span>
  ) : (
    <span className={clsx(styles.addressText, className)}>{ellipse(address, 4, '0x')}</span>
  );

  return (
    <div className={styles.wrapper}>
      {name && <NameServiceImage src={src} fallbackSrc={ENSLogo} width={width} height={height} />}
      <NameServiceContent url={url} noCopy={noCopy} address={address} width={width} className={className} element={element} />
    </div>
  );
}

export function SpaceIDProfile({
  address,
  url,
  width = 24,
  height = 24,
  noCopy = false,
  className,
}: SpaceIDProfileProps) {
  const { spaceID, setSpaceID } = useNameServicesStore();

  useEffect(() => {
    const getData = async () => {
      if (!address) return;
      const addresses = toArray(address, { toCase: 'lower' }).filter((a: string) => !spaceID?.[a]);
      if (addresses.length === 0) return;

      let data = setDefaultData(addresses, spaceID);
      setSpaceID({ ...data });
      data = setDefaultData(addresses, await getSpaceID(addresses) as Record<string, NameServiceEntry> | null);
      setSpaceID({ ...data });
    };

    getData();
  }, [address, spaceID, setSpaceID]);

  const { name } = { ...spaceID?.[toCase(address, 'lower')] };

  if (!name) {
    return <ENSProfile address={address} url={url} width={width} height={height} noCopy={noCopy} className={className} />;
  }

  const element = (
    <span title={name} className={clsx(styles.nameText, className)}>{ellipse(name, 16)}</span>
  );

  return (
    <div className={styles.wrapper}>
      <NameServiceImage src={SpaceIDLogo as unknown as string} fallbackSrc={SpaceIDLogo} width={width} height={height} />
      <NameServiceContent url={url} noCopy={noCopy} address={address} width={width} className={className} element={element} />
    </div>
  );
}

export function EVMProfile({ chain, ...props }: EVMProfileProps) {
  switch (chain) {
    case 'binance':
    case 'arbitrum':
      return <SpaceIDProfile {...props} />;
    default:
      return <ENSProfile {...props} />;
  }
}
