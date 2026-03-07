import { isAxelar } from '@/lib/chain';
import { ENVIRONMENT } from '@/lib/config';
import { isNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { isString, equalsIgnoreCase, capitalize, includesSomePatterns } from '@/lib/string';
import customGMPs from '@/data/custom/gmp';

import type { GMPRowData, EventDataInput } from './GMPs.types';

// ─── Exported utilities (consumed outside this component) ───────────────────

export const getEvent = (data: EventDataInput) => {
  const {
    call,
    interchain_transfer,
    token_manager_deployment_started,
    interchain_token_deployment_started,
    link_token_started,
    token_metadata_registered,
    settlement_forwarded_events,
    settlement_filled_events,
    interchain_transfers,
    originData,
  } = { ...data };

  const origin = originData;

  if (interchain_transfer || origin?.interchain_transfer)
    return 'InterchainTransfer';
  if (
    token_manager_deployment_started ||
    origin?.token_manager_deployment_started
  )
    return 'TokenManagerDeployment';
  if (
    interchain_token_deployment_started ||
    origin?.interchain_token_deployment_started
  )
    return 'InterchainTokenDeployment';
  if (link_token_started || origin?.link_token_started) return 'LinkToken';
  if (token_metadata_registered || origin?.token_metadata_registered)
    return 'TokenMetadataRegistered';
  if (settlement_forwarded_events) return 'SquidCoralSettlementForwarded';
  if (settlement_filled_events || interchain_transfers)
    return 'SquidCoralSettlementFilled';

  return call?.event as string | undefined;
};

export const customData = async (data: GMPRowData) => {
  const { call, interchain_transfer, interchain_transfers } = { ...data };
  const { destinationContractAddress, payload } = { ...call?.returnValues };
  if (!(destinationContractAddress && isString(payload))) return data;

  try {
    const customGMP = toArray(customGMPs).find(
      (d) =>
        toArray(d.addresses as string[]).findIndex((a: string) =>
          equalsIgnoreCase(a, destinationContractAddress as string)
        ) > -1 &&
        (!d.environment || equalsIgnoreCase(d.environment, ENVIRONMENT))
    );
    const { id, name, customize } = { ...customGMP };

    if (typeof customize === 'function') {
      const customValues = await customize(call.returnValues as { destinationContractAddress?: string; payload?: string }, ENVIRONMENT);

      if (
        typeof customValues === 'object' &&
        !Array.isArray(customValues) &&
        Object.keys(customValues).length > 0
      ) {
        const enriched = customValues as Record<string, string> & { projectId?: string; projectName?: string };
        enriched.projectId = id;
        enriched.projectName = name || capitalize(id);
        data.customValues = enriched;
      }
    }

    // interchain transfer
    if (
      interchain_transfer?.destinationAddress &&
      !data.customValues?.recipientAddress
    ) {
      data.customValues = {
        ...data.customValues,
        recipientAddress: interchain_transfer.destinationAddress as string,
        destinationChain: interchain_transfer.destinationChain as string,
        projectId: 'its',
        projectName: 'ITS',
      };
    }

    // interchain transfers
    if (
      toArray(interchain_transfers).length > 0 &&
      !data.customValues?.recipientAddresses
    ) {
      data.customValues = {
        ...data.customValues,
        recipientAddresses: toArray(interchain_transfers).map((d) => ({
          recipientAddress: d.recipient,
          chain: d.destinationChain,
        })),
        projectId: 'squid',
        projectName: 'Squid',
      };
    }
  } catch (error) {}

  return data;
};

export const checkNeedMoreGasFromError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const inner = (error as Record<string, unknown>).error;
  if (!inner || typeof inner !== 'object') return false;
  const { reason, message } = inner as { reason?: string; message?: string };
  return includesSomePatterns(
    [reason ?? '', message ?? ''],
    ['INSUFFICIENT_GAS']
  );
};

// ─── Href / label helpers ───────────────────────────────────────────────────

/**
 * Build the href for a GMP detail page given a row of GMP data.
 */
export function buildGmpHref(d: GMPRowData): string {
  if (d.call.parentMessageID) {
    return `/gmp/${d.call.parentMessageID}`;
  }

  if (d.message_id) {
    return `/gmp/${d.message_id}`;
  }

  const isCosmos = d.call.chain_type === 'cosmos';
  const txHash = isCosmos && isNumber(d.call.messageIdIndex)
    ? d.call.axelarTransactionHash
    : d.call.transactionHash;

  let suffix = '';
  if (isNumber(d.call.logIndex)) {
    suffix = `:${d.call.logIndex}`;
  } else if (isCosmos && isNumber(d.call.messageIdIndex)) {
    suffix = `-${d.call.messageIdIndex}`;
  }

  return `/gmp/${txHash}${suffix}`;
}

/**
 * Derive the human-readable status label for a GMP row.
 */
export function getStatusLabel(d: EventDataInput): string {
  if (
    d.simplified_status === 'received' &&
    (getEvent(d) === 'ContractCall' ||
      (getEvent(d) === 'InterchainTransfer' &&
        isAxelar(d.call?.returnValues?.destinationChain)))
  ) {
    return 'Executed';
  }
  return d.simplified_status ?? '';
}
