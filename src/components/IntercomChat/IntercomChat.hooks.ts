'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Intercom from '@intercom/messenger-js-sdk';
import { ENVIRONMENT } from '@/lib/config';

const INTERCOM_API_BASE = 'https://api-iam.intercom.io';

/**
 * Extracts the transaction identifier from GMP or transaction detail URLs.
 * Matches /gmp/<tx> and /transactions/<tx>.
 * Preserves the full identifier including any log-index suffix (e.g. 0xabc...-1)
 * so the data connector can resolve it as a messageId.
 */
function extractTxFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/(?:gmp|transactions)\/(.+)$/);
  return match?.[1] ?? null;
}

/** Returns the Intercom messenger function, or undefined if not yet initialised. */
function getMessenger(): ((...args: unknown[]) => void) | undefined {
  const messenger = (
    window as unknown as { Intercom?: (...args: unknown[]) => void }
  ).Intercom;
  return typeof messenger === 'function' ? messenger : undefined;
}

/**
 * Resolves the tx identifier to surface to Fin AI.
 * Only set when the user is on a /gmp/ or /transactions/ detail page.
 * Reads window.location.pathname directly so it is always current, even
 * when called from a long-lived closure such as an onShow handler.
 */
function resolveLatestTxHash(): string {
  return extractTxFromPathname(window.location.pathname) ?? '';
}

/**
 * Boots the Intercom messenger and keeps latest_swap_tx_hash in sync with
 * the currently viewed transaction page so Fin AI can look it up without
 * asking the user.
 */
export function useIntercomChat(appId: string | undefined): void {
  const pathname = usePathname();

  // Boot once on mount with the active tx hash already set so Fin never
  // reads a stale value from the anonymous visitor cookie.
  // onShow is registered here (once) so it never captures a stale closure.
  useEffect(() => {
    if (!appId) return;
    Intercom({
      app_id: appId,
      api_base: INTERCOM_API_BASE,
      latest_swap_tx_hash: resolveLatestTxHash(),
      axelar_environment: ENVIRONMENT,
    });

    getMessenger()?.('onShow', () => {
      getMessenger()?.('update', {
        latest_swap_tx_hash: resolveLatestTxHash(),
      });
    });
  }, [appId]);

  // On every route change, update the current path and active tx hash.
  useEffect(() => {
    if (!appId) return;
    getMessenger()?.('update', {
      current_page_path: pathname,
      latest_swap_tx_hash: resolveLatestTxHash(),
    });
  }, [appId, pathname]);
}
