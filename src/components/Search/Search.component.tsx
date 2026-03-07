'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { FiSearch } from 'react-icons/fi';

import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/Button';
import { useNameServicesStore } from '@/components/Profile';
import { useChains, useITSAssets } from '@/hooks/useGlobalData';
import { searchGMP } from '@/lib/api/gmp';
import { searchTransfers } from '@/lib/api/token-transfer';
import { getENS } from '@/lib/api/name-services/ens';
import { getSpaceID } from '@/lib/api/name-services/spaceid';
import { getSlug } from '@/lib/navigation';
import { getITSAssetData } from '@/lib/config';
import { getInputType, split, toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';

import { search as styles } from './Search.styles';

export function Search() {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const { handleSubmit } = useForm();
  const chains = useChains();
  const itsAssets = useITSAssets();
  const { ens, spaceID, setENS, setSpaceID } = useNameServicesStore();

  const onSubmit = async () => {
    let _input = input;
    let type = getInputType(_input, chains!);

    if (type) {
      setSearching(true);

      const { resolvedAddress } = {
        ...Object.values({ ...ens }).find((v: unknown) =>
          equalsIgnoreCase((v as Record<string, string>).name, _input)
        ),
      } as Record<string, Record<string, string> | undefined>;
      const spaceIDDomain = Object.values({ ...spaceID }).find((v: unknown) =>
        equalsIgnoreCase((v as Record<string, string>).name, _input)
      );

      // ens
      if (resolvedAddress) {
        _input = resolvedAddress.id;
        type = 'address';
      }
      // space id
      else if (spaceIDDomain) {
        _input = (spaceIDDomain as Record<string, string>).address;
        type = 'address';
      }
      // domain name
      else if (type === 'domainName') {
        type = 'address';
      }
      // address
      else if (
        ['axelarAddress', 'evmAddress', 'cosmosAddress'].includes(type)
      ) {
        type = type === 'axelarAddress' ? 'account' : 'address';
      }
      // transaction
      else if (['txhash', 'tx'].includes(type)) {
        const gmpTotal = (
          await searchGMP({ txHash: _input, noRecover: true, size: 0 }) as Record<string, unknown>
        )?.total as number | undefined;

        if (gmpTotal && gmpTotal > 0) {
          if (gmpTotal > 1) {
            _input = `search?txHash=${_input}`;
          }

          type = 'gmp';
        } else {
          const transfersTotal = (
            await searchTransfers({ txHash: _input, noRecover: true, size: 0 }) as Record<string, unknown>
          )?.total as number | undefined;

          if (transfersTotal && transfersTotal > 0) {
            if (transfersTotal > 1) {
              _input = `search?txHash=${_input}`;
              type = 'transfers';
            } else {
              type = 'transfer';
            }
          } else {
            type = type === 'txhash' ? 'gmp' : 'tx';
          }
        }
      }

      if (_input && type === 'address') {
        // its asset
        if (getITSAssetData(_input, itsAssets)) {
          _input = `search?assetType=its&itsTokenAddress=${_input}`;
          type = 'gmp';
        }
      }

      // get domain name
      if (_input && type === 'address') {
        await Promise.all(
          ['ens', 'spaceid'].map(
            k =>
              new Promise<void>(async resolve => {
                const addresses = toArray(_input, { toCase: 'lower' });

                switch (k) {
                  case 'ens':
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setENS(await getENS(addresses.filter((a: string) => !ens?.[a])) as any);
                    break;
                  case 'spaceid':
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setSpaceID(
                      await getSpaceID(
                        addresses.filter((a: string) => !spaceID?.[a]),
                        undefined,
                        chains ?? undefined
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ) as any
                    );
                    break;
                  default:
                    break;
                }

                resolve();
              })
          )
        );
      }

      router.push(`/${type}/${_input}`);
      ref.current?.blur();
      setInput('');

      setSearching(false);
    }
  };

  const tx = getSlug(pathname, 'tx');
  const address = getSlug(pathname, 'address');
  const searchable = !searching && !!input && !find(input, [tx as string, address as string]);

  if (!itsAssets) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.wrapper}>
        <input
          ref={ref}
          disabled={searching}
          placeholder="Search by Txhash / Address / Block"
          value={input}
          onChange={e =>
            setInput(split(e.target.value, { delimiter: ' ' }).join(' '))
          }
          className={clsx(
            styles.input,
            searching ? styles.inputSearching : styles.inputIdle,
            searching || searchable
              ? styles.inputPaddingWithIcon
              : styles.inputPaddingDefault
          )}
        />
        {searchable && (
          <Button
            color="blue"
            onClick={() => onSubmit()}
            className={styles.searchButton}
          >
            <FiSearch />
          </Button>
        )}
        {searching && (
          <Spinner className={styles.spinner} />
        )}
      </div>
    </form>
  );
}
