'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Number } from '@/components/Number';
import { useChains, useAssets, useITSAssets, useContracts, useConfigurations, useValidators, useVerifiers } from '@/hooks/useGlobalData';
import { getKeybaseUser } from '@/lib/api/keybase';
import { getENS } from '@/lib/api/name-services/ens';
import { getSpaceID } from '@/lib/api/name-services/spaceid';
import {
  ENVIRONMENT,
  axelarContractFields,
  getChainData,
  getAssetData,
  getITSAssetData,
} from '@/lib/config';
import { getIcapAddress, toHex, toCase, split, toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  capitalize,
  includesSomePatterns,
  ellipse,
  toTitle,
} from '@/lib/string';
import { isNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';
import accounts from '@/data/accounts';
import broadcasters from '@/data/broadcasters';
import ENSLogo from '@/images/name-services/ens.png';
import SpaceIDLogo from '@/images/name-services/spaceid.png';

import {
  nameService as nameServiceStyles,
  profile as profileStyles,
  chainProfile as chainProfileStyles,
  assetProfile as assetProfileStyles,
} from './Profile.styles';

// --- Types ---

interface NameServiceEntry {
  name?: string;
  [key: string]: unknown;
}

interface NameServicesState {
  ens: Record<string, NameServiceEntry> | null;
  spaceID: Record<string, NameServiceEntry> | null;
  setENS: (data: Record<string, NameServiceEntry>) => void;
  setSpaceID: (data: Record<string, NameServiceEntry>) => void;
}

interface ValidatorImageEntry {
  image?: string;
  updatedAt?: number;
}

interface ValidatorImagesState {
  validatorImages: Record<string, ValidatorImageEntry>;
  setValidatorImages: (data: Record<string, ValidatorImageEntry>) => void;
}

interface SpaceIDProfileProps {
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  className?: string;
}

interface ENSProfileProps {
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  origin?: string;
  className?: string;
}

interface EVMProfileProps {
  chain?: string;
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  className?: string;
  [key: string]: unknown;
}

interface ProfileProps {
  i?: number;
  address: string | number[] | null | undefined;
  chain?: string;
  prefix?: string;
  width?: number;
  height?: number;
  noResolveName?: boolean;
  noCopy?: boolean;
  customURL?: string;
  useContractLink?: boolean;
  className?: string;
}

interface ChainProfileProps {
  value: string;
  width?: number;
  height?: number;
  className?: string;
  titleClassName?: string;
}

interface AssetProfileProps {
  value: string;
  chain?: string;
  amount?: number | string;
  addressOrDenom?: string;
  customAssetData?: Record<string, unknown>;
  ITSPossible?: boolean;
  onlyITS?: boolean;
  isLink?: boolean;
  width?: number;
  height?: number;
  className?: string;
  titleClassName?: string;
}

// --- Stores ---

export const useNameServicesStore = create<NameServicesState>()(set => ({
  ens: null,
  spaceID: null,
  setENS: data => set(state => ({ ...state, ens: { ...state.ens, ...data } })),
  setSpaceID: data =>
    set(state => ({ ...state, spaceID: { ...state.spaceID, ...data } })),
}));

const AXELAR_LOGO = '/logos/accounts/axelarnet.svg';
const randImage = (i?: number) =>
  `/logos/addresses/${isNumber(i) ? ((i as number) % 8) + 1 : _.random(1, 8)}.png`;

export const useValidatorImagesStore = create<ValidatorImagesState>()(set => ({
  validatorImages: {},
  setValidatorImages: data =>
    set(state => ({
      ...state,
      validatorImages: { ...state.validatorImages, ...data },
    })),
}));

// --- Components ---

export function SpaceIDProfile({
  address,
  url,
  width = 24,
  height = 24,
  noCopy = false,
  className,
}: SpaceIDProfileProps) {
  const [image404, setImage404] = useState<boolean | null>(null);
  const { spaceID, setSpaceID } = useNameServicesStore();

  useEffect(() => {
    const setDefaultData = (addresses: string[], data: Record<string, NameServiceEntry> | null) => {
      let result = { ...data };
      addresses.forEach(a => {
        if (!result[a]) {
          result = { ...result, [a]: {} };
        }
      });

      return result;
    };

    const getData = async () => {
      if (address) {
        const addresses = toArray(address, { toCase: 'lower' }).filter(
          (a: string) => !spaceID?.[a]
        );

        if (addresses.length > 0) {
          let data = setDefaultData(addresses, spaceID);
          setSpaceID({ ...data });

          data = setDefaultData(addresses, await getSpaceID(addresses) as Record<string, NameServiceEntry> | null);
          setSpaceID({ ...data });
        }
      }
    };

    getData();
  }, [address, spaceID, setSpaceID]);

  const { name } = { ...spaceID?.[toCase(address, 'lower')] };
  const src = SpaceIDLogo;

  const element = name ? (
    <span title={name} className={clsx(nameServiceStyles.nameText, className)}>
      {ellipse(name, 16)}
    </span>
  ) : (
    <span className={clsx(nameServiceStyles.addressText, className)}>
      {ellipse(address, 4, '0x')}
    </span>
  );

  return name ? (
    <div className={nameServiceStyles.wrapper}>
      {typeof image404 === 'boolean' ? (
        <Image
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          src={(image404 ? SpaceIDLogo : src) as any}
          alt=""
          width={width}
          height={height}
          className={clsx(
            nameServiceStyles.imageRoundedFull,
            width === 24 && nameServiceStyles.imageSizeDefault,
            width < 24 ? nameServiceStyles.imageMarginSmall : nameServiceStyles.imageMarginDefault
          )}
        />
      ) : (
        <img
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          src={src as any}
          alt=""
          onLoad={() => setImage404(false)}
          onError={() => setImage404(true)}
          className={clsx(
            nameServiceStyles.imageRoundedFull,
            width === 24 ? nameServiceStyles.imageSizeDefault : nameServiceStyles.imageSizeSmall,
            width < 24 ? nameServiceStyles.imageMarginSmall : nameServiceStyles.imageMarginDefault
          )}
        />
      )}
      {url ? (
        <div className={clsx(nameServiceStyles.linkWrapper, className)}>
          <Link
            href={url}
            target="_blank"
            className={nameServiceStyles.linkText}
          >
            {element}
          </Link>
          {!noCopy && <Copy size={width < 24 ? 16 : 18} value={address} />}
        </div>
      ) : noCopy ? (
        element
      ) : (
        <Copy size={width < 24 ? 16 : 18} value={address}>
          <span className={clsx(className)}>{element}</span>
        </Copy>
      )}
    </div>
  ) : (
    <ENSProfile
      address={address}
      url={url}
      width={width}
      height={height}
      noCopy={noCopy}
      className={className}
    />
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
  const [image404, setImage404] = useState<boolean | null>(null);
  const { ens, setENS } = useNameServicesStore();

  useEffect(() => {
    const setDefaultData = (addresses: string[], data: Record<string, NameServiceEntry> | null) => {
      let result = { ...data };
      addresses.forEach(a => {
        if (!result[a]) {
          result = { ...result, [a]: {} };
        }
      });

      return result;
    };

    const getData = async () => {
      if (address) {
        const addresses = toArray(address, { toCase: 'lower' }).filter(
          (a: string) => !ens?.[a]
        );

        if (addresses.length > 0) {
          let data = setDefaultData(addresses, ens);
          setENS({ ...data });

          data = setDefaultData(addresses, await getENS(addresses) as Record<string, NameServiceEntry> | null);
          setENS({ ...data });
        }
      }
    };

    getData();
  }, [address, ens, setENS]);

  const { name } = { ...ens?.[toCase(address, 'lower')] };
  const src = `https://metadata.ens.domains/mainnet/avatar/${name}`;

  const element = name ? (
    <span title={name} className={clsx(nameServiceStyles.nameText, className)}>
      {ellipse(name, 16)}
    </span>
  ) : (
    <span className={clsx(nameServiceStyles.addressText, className)}>
      {ellipse(address, 4, '0x')}
    </span>
  );

  return (
    <div className={nameServiceStyles.wrapper}>
      {name &&
        (typeof image404 === 'boolean' ? (
          <Image
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            src={(image404 ? ENSLogo : src) as any}
            alt=""
            width={width}
            height={height}
            className={clsx(
              nameServiceStyles.imageRoundedFull,
              width === 24 && nameServiceStyles.imageSizeDefault,
              width < 24 ? nameServiceStyles.imageMarginSmall : nameServiceStyles.imageMarginDefault
            )}
          />
        ) : (
          <img
            src={src}
            alt=""
            onLoad={() => setImage404(false)}
            onError={() => setImage404(true)}
            className={clsx(
              nameServiceStyles.imageRoundedFull,
              width === 24 ? nameServiceStyles.imageSizeDefault : nameServiceStyles.imageSizeSmall,
              width < 24 ? nameServiceStyles.imageMarginSmall : nameServiceStyles.imageMarginDefault
            )}
          />
        ))}
      {url ? (
        <div className={clsx(nameServiceStyles.linkWrapper, className)}>
          <Link
            href={url}
            target="_blank"
            className={nameServiceStyles.linkText}
          >
            {element}
          </Link>
          {!noCopy && <Copy size={width < 24 ? 16 : 18} value={address} />}
        </div>
      ) : noCopy ? (
        element
      ) : (
        <Copy size={width < 24 ? 16 : 18} value={address}>
          <span className={clsx(className)}>{element}</span>
        </Copy>
      )}
    </div>
  );
}

export function EVMProfile({ chain, ...props }: EVMProfileProps) {
  let ProfileComponent: typeof SpaceIDProfile | typeof ENSProfile;

  switch (chain) {
    case 'binance':
    case 'arbitrum':
      ProfileComponent = SpaceIDProfile;
      break;
    default:
      ProfileComponent = ENSProfile;
      break;
  }

  return <ProfileComponent {...props} />;
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contracts: any = useContracts();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configurations: any = useConfigurations();
  const validators = useValidators();
  const verifiers = useVerifiers();
  const { validatorImages, setValidatorImages } = useValidatorImagesStore();

  let address = addressProp;
  let chain = chainProp;
  let prefix = prefixProp;

  // get validator image
  useEffect(() => {
    const getData = async () => {
      if (typeof address === 'string' && address?.startsWith('axelar') && validators) {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(await getKeybaseUser({ key_suffix: identity }) as any),
          };
          const { url } = { ...them?.[0]?.pictures?.primary };

          if (url) {
            image = url;
          }

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
      }
    };

    getData();
  }, [address, validators, setValidatorImages]);

  if (!address) return;

  if (Array.isArray(address)) {
    address = toHex(address);
  }

  // set chain to axelar when address prefix is 'axelar'
  chain = address.startsWith('axelar') ? 'axelarnet' : toCase(chain, 'lower');

  // auto set prefix by address
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

  // contracts
  const {
    interchain_token_service_contract,
    gateway_contracts,
    gas_service_contracts,
  } = { ...contracts };

  const itss = toArray(interchain_token_service_contract?.addresses).map((a: string) => ({
    address: a,
    name: 'Interchain Token Service',
    image: getChainData(chain, chains)?.image || AXELAR_LOGO,
  }));

  const gateways = Object.entries({ ...gateway_contracts })
    .filter(([_k, v]) => (v as Record<string, unknown>)?.address)
    .map(([k, v]) => ({
      ...(v as Record<string, unknown>),
      name: 'Axelar Gateway',
      chain: k,
      image: getChainData(k, chains)?.image || AXELAR_LOGO,
    }));

  const gasServices = Object.entries({ ...gas_service_contracts })
    .filter(([_k, v]) => (v as Record<string, unknown>)?.address)
    .map(([k, v]) => ({
      ...(v as Record<string, unknown>),
      name: 'Axelar Gas Service',
      chain: k,
      image: getChainData(k, chains)?.image || AXELAR_LOGO,
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axelarContractAddresses = toArray(chains).flatMap((d: any) => {
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

  // relayers
  const { relayers, express_relayers, refunders } = { ...configurations };

  const executorRelayers = _.uniq(
    toArray(
      _.concat(
        relayers,
        refunders,
        Object.keys({ ...(broadcasters as Record<string, Record<string, unknown>>)[ENVIRONMENT!] })
      )
    )
  ).map((a) => ({ address: String(a), name: 'Axelar Relayer', image: AXELAR_LOGO }));
  const expressRelayers = _.uniq(toArray(express_relayers)).map((a) => ({
    address: String(a),
    name: 'Axelar Express Relayer',
    image: AXELAR_LOGO,
  }));

  // get custom profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { name, image } = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(_.concat as any)(
      accounts,
      itss,
      gateways,
      gasServices,
      axelarContractAddresses,
      executorRelayers,
      expressRelayers
    ).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => {
        return (
          equalsIgnoreCase(d.address as string, address as string) &&
          (!d.chain || !chain || equalsIgnoreCase(d.chain as string, chain)) &&
          (!d.environment || equalsIgnoreCase(d.environment as string, ENVIRONMENT))
        );
      }
    ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as Record<string, any>;

  // validator | verifier
  let isValidator: boolean | undefined;
  let isVerifier: boolean | undefined;

  // axelar address
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

  // Icap address format for EVM
  if (address.startsWith('0x') && address !== '0x') {
    address = getIcapAddress(address);
  }

  const { explorer } = { ...getChainData(chain, chains) };

  const path =
    useContractLink &&
    explorer?.cannot_link_contract_via_address_path &&
    explorer.contract_path
      ? explorer.contract_path
      : explorer?.address_path;
  const url =
    customURL ||
    (explorer
      ? `${explorer.url}${path?.replace('{address}', address).replace(prefix === 'axelarvaloper' || isVerifier ? '/account' : '', prefix === 'axelarvaloper' ? '/validator' : isVerifier ? '/verifier' : '')}`
      : undefined);

  return name ? (
    <div
      className={clsx(
        profileStyles.wrapperWithName,
        width < 24 ? profileStyles.gapSmall : profileStyles.gapDefault,
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
            profileStyles.imageRoundedFull,
            width === 24 && profileStyles.imageSizeDefault
          )}
        />
      ) : (
        isValidator && (
          <Image
            src={randImage(i)}
            alt=""
            width={width}
            height={height}
            className={clsx(
              profileStyles.imageRoundedFull,
              width === 24 && profileStyles.imageSizeDefault
            )}
          />
        )
      )}
      <div className={clsx(profileStyles.linkWrapper, className)}>
        <Link
          href={
            url ||
            `/${address.startsWith('axelar') ? (prefix === 'axelarvaloper' ? 'validator' : isVerifier ? 'verifier' : 'account') : 'address'}/${address}`
          }
          target="_blank"
          className={profileStyles.linkText}
        >
          {ellipse(name, isValidator ? 10 : 16)}
        </Link>
        {!noCopy && <Copy size={width < 24 ? 16 : 18} value={address} />}
      </div>
    </div>
  ) : address.startsWith('0x') && !noResolveName ? (
    <EVMProfile
      address={address}
      chain={chain}
      url={url}
      width={width}
      height={height}
      noCopy={noCopy}
      className={className}
    />
  ) : url ? (
    <div className={clsx(profileStyles.linkWrapper, className)}>
      <Link
        href={url}
        target="_blank"
        className={profileStyles.linkText}
      >
        {ellipse(address, 4, prefix)}
      </Link>
      {!noCopy && <Copy size={width < 24 ? 16 : 18} value={address} />}
    </div>
  ) : (
    <Copy size={width < 24 ? 16 : 18} value={address}>
      <span className={clsx(className)}>{ellipse(address, 4, prefix)}</span>
    </Copy>
  );
}

export function ChainProfile({
  value,
  width = 24,
  height = 24,
  className = 'h-6',
  titleClassName,
}: ChainProfileProps) {
  const chains = useChains();

  if (!value) return;

  const { name, image } = { ...getChainData(value, chains) };

  return (
    <div className={clsx(chainProfileStyles.wrapper, className)}>
      <Image
        src={image}
        alt=""
        width={width}
        height={height}
        className={className}
      />
      <span
        className={clsx(
          chainProfileStyles.title,
          titleClassName
        )}
      >
        {name || capitalize(value)}
      </span>
    </div>
  );
}

export function AssetProfile({
  value,
  chain: chainProp,
  amount,
  addressOrDenom,
  customAssetData,
  ITSPossible = false,
  onlyITS = false,
  isLink = false,
  width = 24,
  height = 24,
  className = 'h-6',
  titleClassName,
}: AssetProfileProps) {
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();

  let chain = chainProp;

  if (!value) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assetData: any =
    (!onlyITS && getAssetData(addressOrDenom || value, assets)) ||
    (ITSPossible && getITSAssetData(addressOrDenom || value, itsAssets)) ||
    customAssetData;

  const { addresses } = { ...assetData };
  let { symbol, image } = { ...assetData };

  // default to first chain
  if (!chain && assetData?.chains) {
    chain = Object.keys(assetData.chains)[0];
  }

  // set symbol and image of specific chain if exists
  if (chain && addresses?.[chain]) {
    if (addresses[chain].symbol) {
      symbol = addresses[chain].symbol;
    }

    if (addresses[chain].image) {
      image = addresses[chain].image;
    }
  }

  const { url, contract_path } = { ...getChainData(chain, chains)?.explorer };

  const element = value && (
    <div
      className={clsx(
        assetProfileStyles.wrapper,
        isNumber(amount) ? assetProfileStyles.gapWithAmount : assetProfileStyles.gapDefault,
        className
      )}
    >
      <Image src={image} alt="" width={width} height={height} />
      {isNumber(amount) && (
        <Number
          value={amount}
          format="0,0.000000"
          className={clsx(
            assetProfileStyles.amountText,
            titleClassName
          )}
        />
      )}
      <span
        className={clsx(
          assetProfileStyles.symbolText,
          isLink && url
            ? assetProfileStyles.symbolLink
            : assetProfileStyles.symbolDefault,
          titleClassName
        )}
      >
        {symbol || (value === addressOrDenom ? ellipse(value, 4, '0x') : value)}
      </span>
    </div>
  );

  if (isLink && url) {
    return (
      <Link
        href={`${url}${contract_path?.replace('{address}', addressOrDenom || value)}`}
        target="_blank"
      >
        {element}
      </Link>
    );
  }

  return element;
}
