import { toJson, toArray } from '@/lib/parser';
import { removeDoubleQuote, includesSomePatterns } from '@/lib/string';

export const getAttributeValue = (attributes, key) => {
  const { value } = { ...toArray(attributes).find(a => a.key === key) };
  return toJson(value) || removeDoubleQuote(value);
};

export const getMsgIndexFromEvent = event => {
  const attr = toArray(event?.attributes).find(a => a.key === 'msg_index');
  if (!attr || attr.value === undefined || attr.value === null || attr.value === '') return;

  const index = Number(attr.value);
  return Number.isNaN(index) ? undefined : index;
};

export const getEventByType = (events, type) =>
  toArray(events).find(e => includesSomePatterns(e.type, toArray(type)));

// Normalize events from both tx_response.events (preferred) and tx_response.logs
export const normalizeEvents = tx_response => {
  const { events, logs } = { ...tx_response };

  if (events && toArray(events).length > 0) {
    return toArray(events);
  }

  if (logs && toArray(logs).length > 0) {
    const normalizedEvents = [];
    for (const log of toArray(logs)) {
      const msgIndex = log.msg_index;

      const logEvents = toArray(log.events);

      for (const event of logEvents) {
        const hasMsgIndex = toArray(event.attributes).some(
          a => a.key === 'msg_index'
        );

        const attributes = hasMsgIndex
          ? event.attributes
          : msgIndex !== undefined && msgIndex !== null
            ? [
                ...toArray(event.attributes),
                { key: 'msg_index', value: String(msgIndex), index: true },
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

  return [];
};
