'use client';

import { useEffect } from 'react';
import clsx from 'clsx';

import { getENS } from '@/lib/api/name-services/ens';
import { toCase, toArray } from '@/lib/parser';
import { ellipse } from '@/lib/string';
import ENSLogo from '@/images/name-services/ens.png';

import type { ENSProfileProps, NameServiceEntry } from './Profile.types';
import { useNameServicesStore } from './Profile.stores';
import { setDefaultData } from './Profile.utils';
import { NameServiceImage } from './NameServiceImage.component';
import { NameServiceContent } from './NameServiceContent.component';
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
