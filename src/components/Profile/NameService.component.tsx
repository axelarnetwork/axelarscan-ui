'use client';

import { useEffect } from 'react';
import clsx from 'clsx';

import { getENS } from '@/lib/api/name-services/ens';
import { getSpaceID } from '@/lib/api/name-services/spaceid';
import { toCase, toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import ENSLogo from '@/images/name-services/ens.png';
import SpaceIDLogo from '@/images/name-services/spaceid.png';

import type { SpaceIDProfileProps, ENSProfileProps, EVMProfileProps, NameServiceEntry } from './Profile.types';
import { useNameServicesStore } from './Profile.stores';
import { setDefaultData } from './Profile.utils';
import { NameServiceImage, NameServiceContent } from './NameServiceHelpers.component';
import { nameService as styles } from './Profile.styles';

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
