'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { useChains, useContracts, useConfigurations, useValidators, useVerifiers } from '@/hooks/useGlobalData';
import { getKeybaseUser } from '@/lib/api/keybase';
import {
  ENVIRONMENT,
  axelarContractFields,
  getChainData,
} from '@/lib/config';
import { getIcapAddress, toHex, toCase, split, toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  includesSomePatterns,
  ellipse,
  toTitle,
} from '@/lib/string';
import { isNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';
import accounts from '@/data/accounts';
import broadcasters from '@/data/broadcasters';

import type { Chain } from '@/types';

import type { ProfileProps } from './Profile.types';
import { useValidatorImagesStore } from './Profile.stores';
import { getAddressPagePath, getExplorerUrl } from './Profile.utils';
import { EVMProfile } from './NameService.component';
import { profile as styles } from './Profile.styles';

interface KeybaseUserResponse {
  them?: Array<{
    pictures?: {
      primary?: { url?: string };
    };
  }>;
}

interface AccountEntry {
  address: string;
  name: string;
  image?: string;
  chain?: string;
  environment?: string;
}

interface ContractsData {
  interchain_token_service_contract?: {
    addresses?: string[];
    [key: string]: unknown;
  };
  gateway_contracts?: Record<string, { address?: string; [key: string]: unknown }>;
  gas_service_contracts?: Record<string, { address?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

interface ConfigurationsData {
  relayers?: string[];
  express_relayers?: string[];
  refunders?: string[];
  [key: string]: unknown;
}

const AXELAR_LOGO = '/logos/accounts/axelarnet.svg';
const randImage = (i?: number) =>
  `/logos/addresses/${isNumber(i) ? ((i as number) % 8) + 1 : _.random(1, 8)}.png`;

export function Profile({
  i,
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
  const chains = useChains();
  const contracts = useContracts();
  const configurations = useConfigurations();
  const validators = useValidators();
  const verifiers = useVerifiers();
  const { validatorImages, setValidatorImages } = useValidatorImagesStore();

  let address = addressProp;
  let chain = chainProp;
  let prefix = prefixProp;

  useEffect(() => {
    const getData = async () => {
      if (typeof address !== 'string' || !address?.startsWith('axelar') || !validators) return;

      const { operator_address, description } = {
        ...validators.find((d) =>
          includesSomePatterns(address as string, [
            d.broadcaster_address ?? '',
            d.operator_address ?? '',
            d.delegator_address ?? '',
          ].filter(Boolean))
        ),
      };
      const { moniker, identity } = { ...description };

      let value = operator_address ? validatorImages[operator_address] : undefined;
      let { image } = { ...value };

      if (image && timeDiff(value?.updatedAt) < 3600) {
        value = undefined;
      } else if (identity) {
        const { them } = {
          ...(await getKeybaseUser({ key_suffix: identity }) as KeybaseUserResponse | null),
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
          image = randImage();
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
  }, [address, validators, setValidatorImages]);

  if (!address) return null;

  if (Array.isArray(address)) {
    address = toHex(address);
  }

  chain = address.startsWith('axelar') ? 'axelarnet' : toCase(chain, 'lower');

  if (address.startsWith('axelar') && !prefix?.startsWith('axelar')) {
    prefix = 'axelar1';
  } else if (address.startsWith('0x')) {
    prefix = '0x';
  } else if (
    getChainData(chain, chains)?.chain_type === 'cosmos' &&
    split(address, { delimiter: '' }).filter((c: string) => isNumber(c))[0] === '1'
  ) {
    prefix = address.substring(0, address.indexOf('1') + 1);
  }

  const { interchain_token_service_contract, gateway_contracts, gas_service_contracts } = { ...(contracts as ContractsData | null) };

  const itss = toArray(interchain_token_service_contract?.addresses).map((a: string) => ({
    address: a,
    name: 'Interchain Token Service',
    image: getChainData(chain, chains)?.image || AXELAR_LOGO,
  }));

  const gateways = Object.entries({ ...gateway_contracts })
    .filter(([_k, v]) => v?.address)
    .map(([k, v]) => ({
      ...v,
      name: 'Axelar Gateway',
      chain: k,
      image: getChainData(k, chains)?.image || AXELAR_LOGO,
    }));

  const gasServices = Object.entries({ ...gas_service_contracts })
    .filter(([_k, v]) => v?.address)
    .map(([k, v]) => ({
      ...v,
      name: 'Axelar Gas Service',
      chain: k,
      image: getChainData(k, chains)?.image || AXELAR_LOGO,
    }));

  const axelarContractAddresses = toArray(chains).flatMap((d: Chain) => {
    const addresses: { address: string; name: string; image: string }[] = [];
    for (const f of axelarContractFields) {
      const contractField = d[f] as { address?: string } | undefined;
      if (contractField?.address) {
        addresses.push({
          address: contractField.address,
          name: `${d.name} ${f === 'interchain_token_service_hub' ? 'ITS Hub' : toTitle(f, '_', true)}`,
          image: d.image || AXELAR_LOGO,
        });
      }
    }
    return addresses;
  });

  const { relayers, express_relayers, refunders } = { ...(configurations as ConfigurationsData | null) };
  const executorRelayers = _.uniq(
    toArray(_.concat(relayers, refunders, Object.keys({ ...(broadcasters as Record<string, Record<string, unknown>>)[ENVIRONMENT!] })))
  ).map((a) => ({ address: String(a), name: 'Axelar Relayer', image: AXELAR_LOGO }));
  const expressRelayers = _.uniq(toArray(express_relayers)).map((a) => ({
    address: String(a),
    name: 'Axelar Express Relayer',
    image: AXELAR_LOGO,
  }));

  const allAccounts: AccountEntry[] = _.concat(
    accounts as AccountEntry[],
    itss,
    gateways as AccountEntry[],
    gasServices as AccountEntry[],
    axelarContractAddresses,
    executorRelayers,
    expressRelayers,
  );

  let { name, image } = {
    ...allAccounts.find(
      (d: AccountEntry) =>
        equalsIgnoreCase(d.address, address as string) &&
        (!d.chain || !chain || equalsIgnoreCase(d.chain, chain)) &&
        (!d.environment || equalsIgnoreCase(d.environment, ENVIRONMENT))
    ),
  };

  let isValidator: boolean | undefined;
  let isVerifier: boolean | undefined;

  if (address.startsWith('axelar')) {
    if (!name && validators) {
      const { broadcaster_address, operator_address, description } = {
        ...validators.find((d) =>
          includesSomePatterns(address as string, [
            d.broadcaster_address,
            d.operator_address,
            d.delegator_address,
            d.consensus_address,
          ].filter((s): s is string => !!s))
        ),
      };

      isValidator = !!operator_address;
      if (description?.moniker) {
        name = `${description.moniker}${address === broadcaster_address ? `: Proxy` : ''}`;
      }
      if (operator_address && validatorImages[operator_address]?.image) {
        image = validatorImages[operator_address].image;
      }
    }

    if (verifiers) {
      isVerifier = verifiers.findIndex((d) => (d as Record<string, unknown>).address === address) > -1;
    }
  }

  if (address.startsWith('0x') && address !== '0x') {
    address = getIcapAddress(address);
  }

  const { explorer } = { ...getChainData(chain, chains) };
  const url = getExplorerUrl(address, prefix, isVerifier, explorer as Record<string, unknown> | undefined, useContractLink, customURL);
  const copySize = width < 24 ? 16 : 18;

  if (name) {
    return (
      <div className={clsx(styles.wrapperWithName, width < 24 ? styles.gapSmall : styles.gapDefault, className)}>
        {image ? (
          <Image src={image} alt="" width={width} height={height} className={clsx(styles.imageRoundedFull, width === 24 && styles.imageSizeDefault)} />
        ) : (
          isValidator && (
            <Image src={randImage(i)} alt="" width={width} height={height} className={clsx(styles.imageRoundedFull, width === 24 && styles.imageSizeDefault)} />
          )
        )}
        <div className={clsx(styles.linkWrapper, className)}>
          <Link href={url || getAddressPagePath(address, prefix, isVerifier)} target="_blank" className={styles.linkText}>
            {ellipse(name, isValidator ? 10 : 16)}
          </Link>
          {!noCopy && <Copy size={copySize} value={address} />}
        </div>
      </div>
    );
  }

  if (address.startsWith('0x') && !noResolveName) {
    return <EVMProfile address={address} chain={chain} url={url} width={width} height={height} noCopy={noCopy} className={className} />;
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
