import type { NameServiceEntry } from './Profile.types';

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
