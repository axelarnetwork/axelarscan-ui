'use client';

import { useIntercomChat } from './IntercomChat.hooks';

/** Boots the Intercom messenger and syncs the active transaction hash for Fin AI. */
export function IntercomChat() {
  useIntercomChat(process.env.NEXT_PUBLIC_INTERCOM_APP_ID);
  return null;
}
