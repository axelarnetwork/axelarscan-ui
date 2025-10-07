import { KeplrChain } from '../../types/cosmos';

export const getKeplrChainData = async (
  chainId: string
): Promise<KeplrChain | null> => {
  const baseUrl =
    'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/refs/heads/main/cosmos/';

  // the file will either be the full chainId or without the last dash and everything after it
  const lastDashIndex = chainId.lastIndexOf('-');
  const truncatedId =
    lastDashIndex > 0 ? chainId.substring(0, lastDashIndex) : null;

  const urls = [`${baseUrl}${chainId}.json`];
  if (truncatedId) {
    urls.push(`${baseUrl}${truncatedId}.json`);
  }

  const fetchJson = async (url: string): Promise<KeplrChain> => {
    const response = await fetch(url).catch(() => null);

    if (!response || !response.ok) throw new Error('Failed to fetch');

    return response.json();
  };

  try {
    // Return whichever request resolves successfully first
    const chainData = await Promise.any(urls.map(url => fetchJson(url)));
    return chainData;
  } catch {
    return null;
  }
};
