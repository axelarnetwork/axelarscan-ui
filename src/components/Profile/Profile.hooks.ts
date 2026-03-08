import { useEffect, useMemo } from 'react';
import moment from 'moment';

import {
  useChains,
  useContracts,
  useConfigurations,
  useValidators,
  useVerifiers,
} from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { getKeybaseUser } from '@/lib/api/keybase';
import { includesSomePatterns } from '@/lib/string';
import { timeDiff } from '@/lib/time';

import type { Validator } from '@/types';

import type {
  ProfileProps,
  ProfileData,
  KeybaseUserResponse,
} from './Profile.types';
import { useValidatorImagesStore } from './Profile.stores';
import {
  AXELAR_LOGO,
  buildGlobalAccounts,
  buildAllAccounts,
  resolveAddressInput,
  resolveProfile,
  getExplorerUrl,
  randImage,
} from './Profile.utils';

export function useProfileData({
  address: addressProp,
  chain: chainProp,
  prefix: prefixProp = 'axelar',
  width = 24,
  customURL,
  useContractLink,
}: Pick<
  ProfileProps,
  'address' | 'chain' | 'prefix' | 'width' | 'customURL' | 'useContractLink'
>): ProfileData | null {
  const chains = useChains();
  const contracts = useContracts();
  const configurations = useConfigurations();
  const validators = useValidators();
  const verifiers = useVerifiers();
  const { validatorImages, setValidatorImages } = useValidatorImagesStore();

  const globalAccounts = useMemo(
    () => buildGlobalAccounts(contracts, configurations, chains),
    [contracts, configurations, chains]
  );

  useEffect(() => {
    const getData = async () => {
      if (
        typeof addressProp !== 'string' ||
        !addressProp?.startsWith('axelar') ||
        !validators
      )
        return;

      const { operator_address, description } = {
        ...validators.find(d =>
          includesSomePatterns(
            addressProp as string,
            [
              d.broadcaster_address ?? '',
              d.operator_address ?? '',
              d.delegator_address ?? '',
            ].filter(Boolean)
          )
        ),
      };
      const { moniker, identity } = { ...description };

      let value = operator_address
        ? validatorImages[operator_address]
        : undefined;
      let { image } = { ...value };

      if (image && timeDiff(value?.updatedAt) < 3600) {
        value = undefined;
      } else if (identity) {
        const { them } = {
          ...((await getKeybaseUser({
            key_suffix: identity,
          })) as KeybaseUserResponse | null),
        };
        const { url } = { ...them?.[0]?.pictures?.primary };
        if (url) image = url;
        value = { image, updatedAt: moment().valueOf() };
      } else {
        value = undefined;
      }

      if (!image) {
        if (moniker?.startsWith('axelar-core-')) {
          image = AXELAR_LOGO;
        } else if (!identity) {
          image = randImage(addressProp as string);
        }
        if (image) {
          value = { image, updatedAt: moment().valueOf() };
        }
      }

      if (value) {
        setValidatorImages({ [operator_address!]: value });
      }
    };

    getData();
  }, [addressProp, validators, setValidatorImages]);

  if (!addressProp) return null;

  const { address: rawAddress, chain, prefix } = resolveAddressInput(
    addressProp as string | number[],
    chainProp,
    prefixProp,
    chains
  );

  const allAccounts = buildAllAccounts(
    globalAccounts,
    contracts,
    chain,
    chains
  );

  const {
    name,
    image,
    isValidator,
    isVerifier,
    address,
  } = resolveProfile(
    rawAddress,
    chain,
    allAccounts,
    (validators ?? null) as Validator[] | null,
    (verifiers ?? null) as unknown[] | null,
    validatorImages
  );

  const { explorer } = { ...getChainData(chain, chains) };
  const url = getExplorerUrl(
    address,
    prefix,
    isVerifier,
    explorer as Record<string, unknown> | undefined,
    useContractLink,
    customURL
  );
  const copySize = width < 24 ? 16 : 18;

  return { address, chain, prefix, name, image, isValidator, isVerifier, url, copySize };
}
