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
