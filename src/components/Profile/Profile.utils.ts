import _ from 'lodash';

import { ENVIRONMENT, axelarContractFields, getChainData } from '@/lib/config';
import { getIcapAddress, toHex, toCase, split, toArray } from '@/lib/parser';
import { equalsIgnoreCase, includesSomePatterns, toTitle } from '@/lib/string';
import { isNumber } from '@/lib/number';
import accounts from '@/data/accounts';
import broadcasters from '@/data/broadcasters';

import type { Chain, Validator } from '@/types';

import type {
  NameServiceEntry,
  AccountEntry,
  ContractsData,
  ConfigurationsData,
  ValidatorImageEntry,
} from './Profile.types';

export const AXELAR_LOGO = '/logos/accounts/axelarnet.svg';

export function buildGlobalAccounts(
  contracts: unknown,
  configurations: unknown,
  chains: Chain[] | null | undefined
): AccountEntry[] {
  const { gateway_contracts, gas_service_contracts } = {
    ...(contracts as ContractsData | null),
  };

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

  const axelarContractAddresses = (chains ?? []).flatMap((d: Chain) => {
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

  const { relayers, express_relayers, refunders } = {
    ...(configurations as ConfigurationsData | null),
  };
  const executorRelayers = _.uniq(
    toArray(
      _.concat(
        relayers,
        refunders,
        Object.keys({
          ...(broadcasters as Record<string, Record<string, unknown>>)[
            ENVIRONMENT!
          ],
        })
      )
    )
  ).map(a => ({
    address: String(a),
    name: 'Axelar Relayer',
    image: AXELAR_LOGO,
  }));
  const expressRelayers = _.uniq(toArray(express_relayers)).map(a => ({
    address: String(a),
    name: 'Axelar Express Relayer',
    image: AXELAR_LOGO,
  }));

  return _.concat(
    accounts as AccountEntry[],
    gateways as AccountEntry[],
    gasServices as AccountEntry[],
    axelarContractAddresses,
    executorRelayers,
    expressRelayers
  );
}

export function resolveAddressInput(
  addressProp: string | number[],
  chainProp: string | undefined,
  prefixProp: string,
  chains: Chain[] | null | undefined
): { address: string; chain: string; prefix: string } {
  let address: string = Array.isArray(addressProp)
    ? toHex(addressProp)
    : addressProp;

  const chain = address.startsWith('axelar')
    ? 'axelarnet'
    : (toCase(chainProp, 'lower') ?? '');

  let prefix = prefixProp;
  if (address.startsWith('axelar') && !prefix?.startsWith('axelar')) {
    prefix = 'axelar1';
  } else if (address.startsWith('0x')) {
    prefix = '0x';
  } else if (
    getChainData(chain, chains)?.chain_type === 'cosmos' &&
    split(address, { delimiter: '' }).filter((c: string) => isNumber(c))[0] ===
      '1'
  ) {
    prefix = address.substring(0, address.indexOf('1') + 1);
  }

  return { address, chain, prefix };
}

export function buildAllAccounts(
  globalAccounts: AccountEntry[],
  contracts: unknown,
  chain: string,
  chains: Chain[] | null | undefined
): AccountEntry[] {
  const { interchain_token_service_contract } = {
    ...(contracts as ContractsData | null),
  };

  const itss = toArray(interchain_token_service_contract?.addresses).map(
    (a: string) => ({
      address: a,
      name: 'Interchain Token Service',
      image: getChainData(chain, chains)?.image || AXELAR_LOGO,
    })
  );

  return itss.length > 0 ? _.concat(globalAccounts, itss) : globalAccounts;
}

export function resolveProfile(
  address: string,
  chain: string,
  allAccounts: AccountEntry[],
  validators: Validator[] | null,
  verifiers: unknown[] | null,
  validatorImages: Record<string, ValidatorImageEntry>
): {
  name: string | undefined;
  image: string | undefined;
  isValidator: boolean | undefined;
  isVerifier: boolean | undefined;
  address: string;
} {
  let { name, image } = {
    ...allAccounts.find(
      (d: AccountEntry) =>
        equalsIgnoreCase(d.address, address) &&
        (!d.chain || !chain || equalsIgnoreCase(d.chain, chain)) &&
        (!d.environment || equalsIgnoreCase(d.environment, ENVIRONMENT))
    ),
  };

  let isValidator: boolean | undefined;
  let isVerifier: boolean | undefined;
  let resolvedAddress = address;

  if (address.startsWith('axelar')) {
    if (!name && validators) {
      const { broadcaster_address, operator_address, description } = {
        ...validators.find(d =>
          includesSomePatterns(
            address,
            [
              d.broadcaster_address,
              d.operator_address,
              d.delegator_address,
              d.consensus_address,
            ].filter((s): s is string => !!s)
          )
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
      isVerifier =
        verifiers.findIndex(
          d => (d as Record<string, unknown>).address === address
        ) > -1;
    }
  }

  if (address.startsWith('0x') && address !== '0x') {
    resolvedAddress = getIcapAddress(address);
  }

  return { name, image, isValidator, isVerifier, address: resolvedAddress };
}

export function getAddressPagePath(
  address: string,
  prefix: string,
  isVerifier: boolean | undefined
): string {
  if (!address.startsWith('axelar')) return `/address/${address}`;
  if (prefix === 'axelarvaloper') return `/validator/${address}`;
  if (isVerifier) return `/verifier/${address}`;
  return `/account/${address}`;
}

export function getExplorerUrl(
  address: string,
  prefix: string,
  isVerifier: boolean | undefined,
  explorer: Record<string, unknown> | undefined,
  useContractLink: boolean | undefined,
  customURL: string | undefined
): string | undefined {
  if (customURL) return customURL;
  if (!explorer) return undefined;

  const path =
    useContractLink &&
    explorer?.cannot_link_contract_via_address_path &&
    explorer?.contract_path
      ? (explorer.contract_path as string)
      : (explorer?.address_path as string | undefined);

  if (!path) return `${explorer.url}`;

  const resolvedPath = path.replace('{address}', address);
  const accountSuffix =
    prefix === 'axelarvaloper' || isVerifier ? '/account' : '';
  const replacement =
    prefix === 'axelarvaloper' ? '/validator' : isVerifier ? '/verifier' : '';

  return `${explorer.url}${resolvedPath.replace(accountSuffix, replacement)}`;
}

export const randImage = (key?: string) => {
  if (!key) return `/logos/addresses/${Math.floor(Math.random() * 8) + 1}.png`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `/logos/addresses/${(Math.abs(hash) % 8) + 1}.png`;
};

export function setDefaultData(
  addresses: string[],
  data: Record<string, NameServiceEntry> | null
) {
  let result = { ...data };
  addresses.forEach(a => {
    if (!result[a]) {
      result = { ...result, [a]: {} };
    }
  });
  return result;
}
