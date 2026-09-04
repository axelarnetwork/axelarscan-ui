import { toArray } from '@/lib/parser';

/**
 * Pulls the fields worth reading out of a Cosmos transaction's messages.
 *
 * A transaction page shows generic metadata (height, sender, fee) and then the
 * raw JSON. Anything specific to what the transaction actually did was only
 * visible by reading that JSON. This turns the parts that matter into labelled
 * fields for the handful of message types we know how to describe.
 *
 * To cover a new message type, add one entry to MESSAGE_HANDLERS. Types with
 * no entry are left out entirely, so the section simply does not appear rather
 * than showing a half-parsed message.
 */

export interface MessageAmount {
  denom?: string;
  amount?: string;
}

/**
 * How a field should be rendered. Validators are separate from plain accounts
 * because they live on a different page and need their own address prefix.
 */
export type MessageFieldKind = 'account' | 'validator' | 'amount';

export type MessageField =
  | { label: string; kind: 'account' | 'validator'; address: string }
  | { label: string; kind: 'amount'; amount: MessageAmount };

export interface MessageSummary {
  /**
   * Which entry in tx.body.messages this came from. A transaction can carry
   * several, and the original position is kept even when earlier messages were
   * skipped, so it still lines up with the raw JSON further down the page.
   */
  index: number;
  /** Short type name, e.g. MsgBeginRedelegate. */
  type: string;
  /** What the message does, in words. */
  label: string;
  fields: MessageField[];
}

type MessageExtractor = (message: Record<string, unknown>) => MessageField[];

interface MessageHandler {
  label: string;
  extract: MessageExtractor;
}

const readString = (
  message: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = message[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const readAmount = (
  message: Record<string, unknown>,
  key = 'amount'
): MessageAmount | undefined => {
  const value = message[key];

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const { denom, amount } = value as Record<string, unknown>;

  // A Coin is always a decimal string plus a denom. Anything else would reach
  // formatUnits, which throws on input it cannot parse.
  if (typeof amount !== 'string' || !/^\d+(\.\d+)?$/.test(amount)) {
    return undefined;
  }

  if (typeof denom !== 'string' || !denom) return undefined;

  return { denom, amount };
};

const accountField = (
  label: string,
  address: string | undefined
): MessageField | undefined =>
  address ? { label, kind: 'account', address } : undefined;

const validatorField = (
  label: string,
  address: string | undefined
): MessageField | undefined =>
  address ? { label, kind: 'validator', address } : undefined;

const amountField = (
  label: string,
  amount: MessageAmount | undefined
): MessageField | undefined =>
  amount ? { label, kind: 'amount', amount } : undefined;

/**
 * One entry per message type we can describe. Add to this to cover more.
 */
export const MESSAGE_HANDLERS: Record<string, MessageHandler> = {
  '/cosmos.staking.v1beta1.MsgBeginRedelegate': {
    label: 'Redelegate',
    extract: message =>
      toArray([
        accountField('Delegator', readString(message, 'delegator_address')),
        validatorField(
          'From validator',
          readString(message, 'validator_src_address')
        ),
        validatorField(
          'To validator',
          readString(message, 'validator_dst_address')
        ),
        amountField('Amount', readAmount(message)),
      ]),
  },
  '/cosmos.staking.v1beta1.MsgDelegate': {
    label: 'Delegate',
    extract: message =>
      toArray([
        accountField('Delegator', readString(message, 'delegator_address')),
        validatorField('Validator', readString(message, 'validator_address')),
        amountField('Amount', readAmount(message)),
      ]),
  },
  '/cosmos.staking.v1beta1.MsgUndelegate': {
    label: 'Undelegate',
    extract: message =>
      toArray([
        accountField('Delegator', readString(message, 'delegator_address')),
        validatorField('Validator', readString(message, 'validator_address')),
        amountField('Amount', readAmount(message)),
      ]),
  },
};

/**
 * Trailing segment of the protobuf type URL. Shown beside the label so a
 * section can be matched to its entry in the raw JSON further down the page.
 *
 * `/cosmos.staking.v1beta1.MsgBeginRedelegate` -> `MsgBeginRedelegate`
 */
export const shortMessageType = (type: string): string =>
  type.split('.').pop() || type;

/** The only part of the LCD response this reads. */
type MessagesSource =
  | { tx?: { body?: { messages?: unknown } } }
  | null
  | undefined;

export function extractMessageSummaries(data: unknown): MessageSummary[] {
  const { messages } = { ...(data as MessagesSource)?.tx?.body };

  // Deliberately not toArray here: it drops blank entries, which would shift
  // every later index and break the correspondence with the raw JSON.
  const list = Array.isArray(messages) ? messages : toArray(messages);

  return list.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];

    const message = entry as Record<string, unknown>;
    const type = readString(message, '@type');
    // Own properties only - an @type of "constructor" would otherwise resolve
    // to something off Object.prototype.
    const handler =
      type && Object.prototype.hasOwnProperty.call(MESSAGE_HANDLERS, type)
        ? MESSAGE_HANDLERS[type]
        : undefined;

    if (!type || !handler) return [];

    const fields = handler.extract(message);

    // A message we recognise but cannot read anything out of is not worth a
    // row of its own - the raw JSON below already shows it.
    if (fields.length === 0) return [];

    return [
      {
        index,
        type: shortMessageType(type),
        label: handler.label,
        fields,
      },
    ];
  });
}
