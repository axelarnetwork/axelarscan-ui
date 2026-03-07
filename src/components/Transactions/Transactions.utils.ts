import _ from 'lodash';
import {
  getAttributeValue,
  getMsgIndexFromEvent,
  getEventByType,
  normalizeEvents,
} from '@/lib/chain/cosmos';
import { getAssetData } from '@/lib/config';
import {
  toJson,
  toHex,
  split,
  toArray,
} from '@/lib/parser';
import {
  isString,
  equalsIgnoreCase,
  capitalize,
  camel,
  removeDoubleQuote,
  lastString,
  find,
  includesSomePatterns,
} from '@/lib/string';
import { isNumber, formatUnits } from '@/lib/number';

import type { Asset } from '@/types';
import type {
  TransactionData,
  TransactionMessage,
  TransactionAmount,
  TransactionActivity,
  CosmosEventLike,
  CosmosAttributeLike,
  VoteEvent,
  PacketData,
} from './Transactions.types';

export const getType = (data: TransactionData | null | undefined): string | undefined => {
  if (!data) return;

  let { types, type } = { ...data };
  const { messages } = { ...data.tx?.body };

  if (Array.isArray(types)) {
    if (types[0]) {
      type = types[0];
    }
  } else {
    types = _.uniq(
      toArray(
        _.concat(
          toArray<TransactionMessage>(messages).map((d) =>
            camel(isString(d.msg) ? (d.msg as string) : Object.keys({ ...d.msg })[0])
          ),
          toArray<TransactionMessage>(messages).map((d) => d.inner_message?.['@type'] as string | undefined),
          normalizeEvents(data as Parameters<typeof normalizeEvents>[0])
            .filter((e) => equalsIgnoreCase(e.type, 'message'))
            .map((e) => getAttributeValue(e.attributes as CosmosAttributeLike[], 'action') as string | undefined),
          toArray<TransactionMessage>(messages).map((m) => m['@type'])
        ).map((d) => capitalize(lastString(d, '.')))
      )
    );

    type = types.filter((d: string) => !types!.includes(`${d}Request`))[0];
  }

  return type?.replace('Request', '');
};

export const getActivities = (data: TransactionData | null | undefined, assets: Asset[] | null | undefined): TransactionActivity[] | undefined => {
  const { messages } = { ...data?.tx?.body };
  if (!messages) return;

  let result: TransactionActivity[] | undefined;

  // Direct send / IBC / client / acknowledgement related messages
  if (
    includesSomePatterns(
      messages.map((d: TransactionMessage) => d['@type']).filter((t): t is string => !!t),
      [
        'MsgSend',
        'MsgTransfer',
        'RetryIBCTransferRequest',
        'RouteIBCTransfersRequest',
        'MsgUpdateClient',
        'MsgAcknowledgement',
        'SignCommands',
      ]
    )
  ) {
    // Normalize events once outside the loop for better performance
    const normalizedEvents = normalizeEvents(data as Parameters<typeof normalizeEvents>[0]);

    result = toArray<TransactionActivity>(
      messages.flatMap((d: TransactionMessage, i: number): TransactionActivity[] => {
        let { sender, source_channel, destination_channel } = { ...d };
        let recipient = d.to_address || d.receiver || d.sender;
        let amount: TransactionAmount[] | string | undefined = d.amount;

        sender = d.from_address || d.signer || sender;
        recipient = d.to_address || d.receiver || recipient;

        if (!amount) {
          amount = d.token ? [d.token] : undefined;
        }

        // Scope send_packet event to this message via msg_index
        const msgEvents = normalizedEvents.filter(
          (e) => getMsgIndexFromEvent(e as Parameters<typeof getMsgIndexFromEvent>[0]) === i
        );
        const sendPacketEvent = getEventByType(
          msgEvents as Parameters<typeof getEventByType>[0],
          'send_packet'
        ) as CosmosEventLike | undefined;
        const { attributes } = { ...sendPacketEvent };

        if (attributes) {
          if (!source_channel) {
            source_channel = getAttributeValue(
              attributes as CosmosAttributeLike[],
              'packet_src_channel'
            ) as string | undefined;
          }

          if (!destination_channel) {
            destination_channel = getAttributeValue(
              attributes as CosmosAttributeLike[],
              'packet_dst_channel'
            ) as string | undefined;
          }
        }

        const assetData = getAssetData(data!.denom, assets);

        const activity: TransactionActivity = {
          type: lastString(d['@type'], '.'),
          sender,
          recipient,
          signer: d.signer,
          chain: d.chain,
          asset_data: assetData,
          symbol: assetData?.symbol,
          send_packet_data: attributes
            ? Object.fromEntries(
                (attributes as CosmosAttributeLike[]).map((a) => [a.key, a.value])
              )
            : undefined,
          packet: d.packet,
          acknowledgement: d.acknowledgement,
          source_channel,
          destination_channel,
          timeout_timestamp: formatUnits(String(d.timeout_timestamp ?? '0'), 6),
        };

        if (!amount || (Array.isArray(amount) && amount.length === 0)) {
          return [];
        }

        const amountArray = Array.isArray(amount) ? amount : undefined;

        if (amountArray && toArray<TransactionAmount>(amountArray).length > 0) {
          return toArray<TransactionAmount>(amountArray).map((x): TransactionActivity => ({
            ...x,
            ...activity,
            amount: formatUnits(String(x.amount ?? '0'), assetData?.decimals || 6),
          }));
        }

        return [{
          ...activity,
          amount: formatUnits(String(amount), assetData?.decimals || 6),
        }];
      })
    );
  }
  // Confirm* / Vote-related messages
  else if (
    includesSomePatterns(
      messages.flatMap((d: TransactionMessage) => toArray([d['@type'], d.inner_message?.['@type']])),
      [
        'ConfirmDeposit',
        'ConfirmTokenRequest',
        'ConfirmGatewayTx',
        'ConfirmTransferKey',
        'VoteRequest',
      ]
    )
  ) {
    result = toArray<TransactionActivity>(
      messages.flatMap((d: TransactionMessage) => {
        let { chain, asset, tx_id } = { ...d };
        const innerMessage = d.inner_message as { poll_id?: string; vote?: { chain?: string; events?: VoteEvent[]; [key: string]: unknown } } | undefined;
        const { poll_id, vote } = { ...innerMessage };

        chain = vote?.chain || chain;
        const assetName = typeof asset === 'object' ? asset?.name : asset;
        tx_id = toHex(vote?.events?.[0]?.tx_id || tx_id) || tx_id;
        const status = (vote?.events?.[0]?.status || d.status) as string | undefined;

        if (!d.sender) return undefined;

        return {
          type: lastString(d['@type'], '.'),
          sender: d.sender,
          chain,
          deposit_address: d.deposit_address,
          burner_address: d.burner_address,
          tx_id,
          asset: assetName,
          denom: d.denom,
          asset_data: getAssetData(d.denom || assetName, assets),
          status,
          poll_id,
          events: toArray<VoteEvent>(vote?.events).flatMap((e) =>
            Object.entries(e)
              .filter(
                ([, v]) => v && typeof v === 'object' && !Array.isArray(v)
              )
              .map(([k, v]) => ({
                event: k,
                ...Object.fromEntries(
                  Object.entries(v as Record<string, unknown>).map(([k2, v2]) => [k2, toHex(v2)])
                ),
              }))
          ),
        } as TransactionActivity;
      }).filter((item): item is TransactionActivity => !!item)
    );
  }

  if (toArray<TransactionActivity>(result).length < 1) {
    result = normalizeEvents(data as Parameters<typeof normalizeEvents>[0]).flatMap((e) => {
      const cosmosEvent = e as CosmosEventLike;
      if (find(cosmosEvent.type, ['delegate', 'unbond', 'transfer'])) {
        const out: TransactionActivity[] = [];
        const template: TransactionActivity = { type: cosmosEvent.type, action: cosmosEvent.type };
        let _e: TransactionActivity = _.cloneDeep(template);

        toArray<CosmosAttributeLike>(cosmosEvent.attributes).forEach((a) => {
          const { key, value } = { ...a };
          (_e as Record<string, unknown>)[key] = value;

          switch (key) {
            case 'amount': {
              const index =
                split(value, { delimiter: '' }).findIndex((c: string) => !isNumber(c)) ||
                -1;
              if (index > -1) {
                const denom = value!.substring(index);
                const assetData = getAssetData(denom, assets);
                _e.denom = assetData?.denom || denom;
                _e.symbol = assetData?.symbol;
                (_e as Record<string, unknown>)[key] = formatUnits(
                  value!.replace(denom, ''),
                  assetData?.decimals || 6
                );
              }
              break;
            }
            case 'validator':
              _e.recipient = value ?? undefined;
              break;
            default:
              break;
          }

          if (
            key ===
            (toArray<CosmosAttributeLike>(cosmosEvent.attributes).findIndex((a) => a.key === 'denom') > -1
              ? 'denom'
              : 'amount')
          ) {
            const { delegator_address } = {
              ...messages.find((x: TransactionMessage) => x.delegator_address),
            };

            switch (cosmosEvent.type.toLowerCase()) {
              case 'delegate':
                _e.sender = _e.sender || delegator_address;
                break;
              case 'unbond':
                _e.recipient = (_e.recipient || delegator_address) as string | undefined;
                break;
              default:
                break;
            }

            out.push(_e);
            _e = _.cloneDeep(template);
          }
        });

        return out;
      }

      const event: TransactionActivity = {
        type: cosmosEvent.type,
        ...(_.assign as (...args: Record<string, unknown>[]) => Record<string, unknown>).apply(
          _,
          toArray<CosmosAttributeLike>(cosmosEvent.attributes).map(({ key, value }) => {
            const attribute: Record<string, unknown> = {};

            switch (key) {
              case 'amount': {
                const i =
                  split(value, { delimiter: '' }).findIndex(
                    (c: string) => !isNumber(c)
                  ) || -1;

                if (i > -1) {
                  const denom = (value as string).substring(i);
                  const assetData = getAssetData(denom, assets);

                  attribute.denom = assetData?.denom || denom;
                  attribute.symbol = assetData?.symbol;
                  attribute[key] = formatUnits(
                    (value as string).replace(denom, ''),
                    assetData?.decimals || 6
                  );
                }
                break;
              }
              case 'action':
                attribute[key] = lastString(value, '.');
                break;
              default:
                attribute[key] = removeDoubleQuote(value);
                break;
            }

            let { symbol, amount } = { ...attribute } as { symbol?: string; amount?: string | number };

            if (
              key === 'amount' &&
              isString(value) &&
              (data!.denom || data!.asset)
            ) {
              symbol =
                getAssetData(data!.denom || data!.asset, assets)?.symbol ||
                symbol;
            }

            if (!symbol) {
              const denomAttr = getAttributeValue(
                cosmosEvent.attributes as CosmosAttributeLike[],
                'denom'
              ) as string | undefined;
              const amountDataAttr = getAttributeValue(
                cosmosEvent.attributes as CosmosAttributeLike[],
                'amount'
              ) as string | undefined;

              if (denomAttr) {
                const assetData = getAssetData(denomAttr, assets);

                attribute.denom = assetData?.denom || denomAttr;

                if (assetData?.symbol) {
                  symbol = assetData.symbol;
                }

                amount = formatUnits(amountDataAttr, assetData?.decimals || 6);
              } else if (amountDataAttr) {
                const i =
                  split(amountDataAttr, { delimiter: '' }).findIndex(
                    (c: string) => !isNumber(c)
                  ) || -1;

                if (i > -1) {
                  const denom = amountDataAttr.substring(i);
                  const assetData = getAssetData(denom, assets);

                  attribute.denom = assetData?.denom || denom;

                  if (assetData?.symbol) {
                    symbol = assetData.symbol;
                  }

                  amount = formatUnits(
                    amountDataAttr.replace(denom, ''),
                    assetData?.decimals || 6
                  );
                }
              }
            }

            attribute.symbol = symbol;
            attribute.amount = amount;

            return attribute;
          })
        ),
      };

      return [
        {
          ...event,
          action: event.action || cosmosEvent.type,
          recipient: _.uniq(
            toArray<CosmosAttributeLike>(cosmosEvent.attributes)
              .filter((a) => a.key === 'recipient')
              .map((a) => a.value)
              .filter((v): v is string => !!v)
          ),
        } as TransactionActivity,
      ];
    });

    const delegateEventTypes = ['delegate', 'unbond'];
    const transferEventTypes = ['transfer'];

    const resultTypes = toArray<TransactionActivity>(result).map((e) => e.type).filter((t): t is string => !!t);

    if (includesSomePatterns(resultTypes, delegateEventTypes)) {
      result = toArray<TransactionActivity>(result).filter((e) => delegateEventTypes.includes(e.type!));
    } else if (includesSomePatterns(resultTypes, transferEventTypes)) {
      result = toArray<TransactionActivity>(result).filter((e) => transferEventTypes.includes(e.type!));
    } else {
      result = [
        (_.assign as (...args: Record<string, unknown>[]) => TransactionActivity)
          .apply(_, toArray<TransactionActivity>(result) as Record<string, unknown>[]),
      ];
    }
  }

  if (toArray<TransactionActivity>(result).length < 1 && data!.code) {
    return [{ failed: true }];
  }

  return toArray<TransactionActivity>(result).map((d) => {
    let { packet_data, symbol } = { ...d };

    if (isString(packet_data)) {
      try {
        const parsedPacket = toJson<PacketData>(packet_data as string);

        const assetData = getAssetData(parsedPacket?.denom, assets);

        packet_data = {
          ...parsedPacket,
          amount: formatUnits(String(parsedPacket?.amount ?? '0'), assetData?.decimals),
        };

        if (assetData?.symbol) {
          symbol = assetData.symbol;
        }
      } catch (_error) {}
    } else if (d.asset) {
      symbol = getAssetData(d.asset, assets)?.symbol || symbol;
    }

    return { ...d, packet_data, symbol };
  });
};

export const getSender = (data: TransactionData | null | undefined, assets: Asset[] | null | undefined): string | undefined => {
  if (!data) return;

  const { messages } = { ...data.tx?.body };

  return toArray(
    toArray<string | false>([
      equalsIgnoreCase(getType(data), 'MsgDelegate') && 'delegator_address',
      equalsIgnoreCase(getType(data), 'MsgUndelegate') && 'validator_address',
      'sender',
      'signer',
    ]).map(
      (f) =>
        toArray<TransactionMessage>(messages).map((d) => d[f as keyof TransactionMessage])[0] ||
        (data as Record<string, unknown>)[`tx.body.messages.${f}`] ||
        toArray<TransactionActivity>(getActivities(data, assets)).find((d) => (d as Record<string, unknown>)[f as string])?.[f as keyof TransactionActivity]
    )
  )[0] as string | undefined;
};

export const getRecipient = (data: TransactionData | null | undefined, assets: Asset[] | null | undefined): string | undefined => {
  if (!data) return;

  const { messages } = { ...data.tx?.body };

  return toArray(
    toArray<string | false>([
      equalsIgnoreCase(getType(data), 'MsgDelegate') && 'validator_address',
      equalsIgnoreCase(getType(data), 'MsgUndelegate') && 'delegator_address',
      'recipient',
    ]).map(
      (f) =>
        toArray<TransactionMessage>(messages).map((d) => d[f as keyof TransactionMessage])[0] ||
        (data as Record<string, unknown>)[`tx.body.messages.${f}`] ||
        toArray<TransactionActivity>(getActivities(data, assets)).find((d) => (d as Record<string, unknown>)[f as string])?.[f as keyof TransactionActivity]
    )
  )[0] as string | undefined;
};
