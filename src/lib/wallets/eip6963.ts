import type { EIP1193Provider, EIP6963ProviderDetail } from '@/types/EthereumProviderTypes';

/**
 * Discover the MetaMask provider via EIP-6963 events.
 * Returns the EIP-1193 provider for MetaMask if present, otherwise undefined.
 */
export function discoverMetaMaskProvider(): EIP1193Provider | undefined {
  const providers: EIP6963ProviderDetail[] = [];

  function onAnnouncement(event: CustomEvent<EIP6963ProviderDetail>) {
    const { info, provider } = event.detail;

    // Prevent duplicates based on uuid
    if (providers.some((p) => p.info.uuid === info.uuid)) return;

    providers.push({ info, provider });
  }

  // Listen for provider announcements
  window.addEventListener('eip6963:announceProvider', onAnnouncement as EventListener);

  // Request providers to announce themselves (wallets respond synchronously)
  window.dispatchEvent(new Event('eip6963:requestProvider'));

  window.removeEventListener('eip6963:announceProvider', onAnnouncement as EventListener);

  // Find MetaMask specifically by rdns (Reverse DNS identifier)
  const metamask = providers.find(
    (p) =>
      p.info.rdns === 'io.metamask' ||
      p.info.rdns === 'io.metamask.flask'
  );

  return metamask?.provider;
}
