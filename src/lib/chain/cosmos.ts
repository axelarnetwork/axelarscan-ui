import { toJson, toArray } from '@/lib/parser';
import { removeDoubleQuote, includesSomePatterns } from '@/lib/string';

interface CosmosAttribute {
  key: string;
  value?: string | null;
  index?: boolean;
}

interface CosmosEvent {
  type: string;
  attributes?: CosmosAttribute[];
}

interface CosmosLog {
  msg_index?: number;
  events?: CosmosEvent[];
}

interface CosmosTxResponse {
  events?: CosmosEvent[];
  logs?: CosmosLog[];
}

export const getAttributeValue = (
  attributes: CosmosAttribute[] | undefined,
  key: string
) => {
  const { value } = {
    ...(toArray(attributes).find(a => (a as CosmosAttribute).key === key) as
      | CosmosAttribute
      | undefined),
  };
  return toJson(value) || removeDoubleQuote(value);
};

export const getMsgIndexFromEvent = (event: CosmosEvent) => {
  const attr = toArray(event?.attributes).find(
    a => (a as CosmosAttribute).key === 'msg_index'
  ) as CosmosAttribute | undefined;
  if (
    !attr ||
    attr.value === undefined ||
    attr.value === null ||
    attr.value === ''
  )
    return;

  const index = Number(attr.value);
  return Number.isNaN(index) ? undefined : index;
};

export const getEventByType = (
  events: CosmosEvent[] | undefined,
  type: string | string[]
) =>
  toArray(events).find(e =>
    includesSomePatterns((e as CosmosEvent).type, toArray(type))
  );

// Normalize events from both tx_response.logs (preferred) and tx_response.events
export const normalizeEvents = (tx_response: CosmosTxResponse) => {
  const { events, logs } = { ...tx_response };

  if (logs && toArray(logs).length > 0) {
    const normalizedEvents: CosmosEvent[] = [];
    for (const rawLog of toArray(logs)) {
      const log = rawLog as CosmosLog;
      const msgIndex = log.msg_index;

      const logEvents = toArray(log.events) as CosmosEvent[];

      for (const event of logEvents) {
        const hasMsgIndex = toArray(event.attributes).some(
          a => (a as CosmosAttribute).key === 'msg_index'
        );

        const attributes: CosmosAttribute[] | undefined = hasMsgIndex
          ? event.attributes
          : msgIndex !== undefined && msgIndex !== null
            ? [
                ...(toArray(event.attributes) as CosmosAttribute[]),
                {
                  key: 'msg_index',
                  value: String(msgIndex),
                  index: true,
                },
              ]
            : event.attributes;

        normalizedEvents.push({
          ...event,
          attributes,
        });
      }
    }
    return normalizedEvents;
  }

  if (events && toArray(events).length > 0) {
    return toArray(events);
  }

  return [];
};
