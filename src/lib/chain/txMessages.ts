import { safeBase64ToString, toArray, toHex, toJson } from '@/lib/parser';
import { toTitle } from '@/lib/string';

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
export type MessageFieldKind =
  | 'account'
  | 'validator'
  | 'amount'
  | 'text'
  | 'chain'
  | 'hash'
  | 'link';

export type MessageField =
  | { label: string; kind: 'account' | 'validator'; address: string }
  | { label: string; kind: 'amount'; amount: MessageAmount }
  | { label: string; kind: 'text'; text: string }
  | { label: string; kind: 'chain'; chain: string }
  /**
   * One or more transaction hashes, already hex encoded. `gmp` marks them as
   * GMP calls, so the hash itself links to the cross-chain message page.
   */
  | {
      label: string;
      kind: 'hash';
      hashes: string[];
      chain?: string;
      gmp?: boolean;
    }
  | { label: string; kind: 'link'; text: string; href: string };

export interface MessageSummary {
  /**
   * Which entry in tx.body.messages this came from. A transaction can carry
   * several, and the original position is kept even when earlier messages were
   * skipped, so it still lines up with the raw JSON further down the page.
   */
  index: number;
  /**
   * Position within an envelope that held several messages. One BatchRequest
   * can hold two identical calls, which would otherwise be indistinguishable
   * to React's key.
   */
  innerIndex: number;
  /** Short type name, e.g. MsgBeginRedelegate. */
  type: string;
  /**
   * Set when this message arrived wrapped in another one, naming the wrapper
   * so the section still corresponds to what the raw JSON shows.
   */
  wrappedIn?: string;
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

/**
 * Axelar messages carry both `sender` and a `sender_deprecated` kept for
 * decoding old transactions. Validators running older software populate only
 * the deprecated one, and the address is right there in the payload, so fall
 * back to it rather than dropping the row.
 */
const readSender = (message: Record<string, unknown>): string | undefined =>
  readString(message, 'sender') ?? readString(message, 'sender_deprecated');

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

/**
 * Byte fields arrive in two shapes, both from the same LCD response: a poll
 * request's tx_ids come as arrays of byte values, while the tx_id inside a
 * vote's events is already a hex string. toHex handles both, returning a
 * string unchanged.
 */
const readHashes = (value: unknown): string[] =>
  toArray(value)
    .map(entry =>
      Array.isArray(entry) || typeof entry === 'string'
        ? toHex(entry)
        : undefined
    )
    // Only real hex: toHex returns a non-array string unchanged, so without
    // this a base64 field would render as a hash with a dead explorer link.
    .filter((hex): hex is string => /^0x[0-9a-f]+$/i.test(hex ?? ''));

const textField = (
  label: string,
  text: string | undefined
): MessageField | undefined =>
  text ? { label, kind: 'text', text } : undefined;

const chainField = (
  label: string,
  chain: string | undefined
): MessageField | undefined =>
  chain ? { label, kind: 'chain', chain } : undefined;

const hashField = (
  label: string,
  hashes: string[],
  chain?: string,
  gmp = false
): MessageField | undefined =>
  hashes.length > 0 ? { label, kind: 'hash', hashes, chain, gmp } : undefined;

const linkField = (
  label: string,
  text: string | undefined,
  href: (value: string) => string
): MessageField | undefined =>
  text ? { label, kind: 'link', text, href: href(text) } : undefined;

/**
 * Coins are a repeated field on bank messages. Not toArray here: it stringifies
 * a bare object rather than wrapping it, which silently dropped a single coin.
 */
const coinFields = (
  label: string,
  value: unknown
): (MessageField | undefined)[] => {
  const coins = Array.isArray(value) ? value : value ? [value] : [];

  return coins.map((coin, index) =>
    amountField(
      // Numbered only when there are several, so two rows cannot share a label.
      coins.length > 1 ? `${label} ${index + 1}` : label,
      readAmount({ amount: coin })
    )
  );
};

const readObject = (
  message: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined => {
  const value = message[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
};

/** VOTE_OPTION_YES -> Yes */
const readVoteOption = (option: string | undefined): string | undefined =>
  option
    ? toTitle(option.replace(/^VOTE_OPTION_/, '').toLowerCase(), '_', true)
    : undefined;

/**
 * A CosmWasm execute payload's single top level key names the action, e.g.
 * {"submit_signature": {...}}. That name is the useful part - it is how an
 * amplifier poll or routing call identifies itself.
 *
 * The LCD returns `msg` already decoded as an object; base64 is only what the
 * raw protobuf carries. Both are handled, since toJson passes an object
 * through and safeBase64ToString leaves a non-string alone.
 */
const readContractAction = (
  message: Record<string, unknown>
): string | undefined => {
  const decoded = toJson(safeBase64ToString(message.msg));

  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
    return undefined;
  }

  const [action] = Object.keys(decoded as Record<string, unknown>);
  return action ? toTitle(action, '_', true) : undefined;
};

/**
 * The three IBC packet messages all wrap the same packet, whose `data` is a
 * base64 JSON transfer payload. The Packet data section further down the page
 * is driven by events, which these transactions do not carry, so this is the
 * only place the payload is shown.
 */
interface IbcPacket {
  sequence?: string;
  route?: string;
  sender?: string;
  receiver?: string;
  amount?: MessageAmount;
}

const readPacket = (message: Record<string, unknown>): IbcPacket => {
  const packet = readObject(message, 'packet') ?? {};
  const source = readString(packet, 'source_channel');
  const destination = readString(packet, 'destination_channel');
  const data = toJson(safeBase64ToString(packet.data));
  const payload =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};

  return {
    sequence: readString(packet, 'sequence'),
    route: source && destination ? `${source} -> ${destination}` : undefined,
    sender: readString(payload, 'sender'),
    receiver: readString(payload, 'receiver'),
    // A transfer payload carries denom and amount as sibling strings, not as
    // the Coin object readAmount expects, so rebuild one to get its checks.
    amount: readAmount({
      amount: { denom: payload.denom, amount: payload.amount },
    }),
  };
};

/** {"result":"AQ=="} means it succeeded; {"error":"..."} carries the reason. */
const readAcknowledgement = (
  message: Record<string, unknown>
): string | undefined => {
  const decoded = toJson(safeBase64ToString(message.acknowledgement));

  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
    return undefined;
  }

  const { result, error } = decoded as Record<string, unknown>;

  if (typeof error === 'string' && error) return error;

  return result ? 'Success' : undefined;
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
  // --- Axelar validator traffic. Nearly every transaction on the chain is one
  // of these, wrapped in a RefundMsgRequest (see UNWRAPPERS below).
  '/axelar.vote.v1beta1.VoteRequest': {
    label: 'Vote',
    extract: message => {
      const vote = readObject(message, 'vote');
      const events = toArray(vote?.events) as Record<string, unknown>[];

      // Only a gateway contract call has a page under /gmp. Everything voted on
      // today is one, but a transfer or token event would link nowhere.
      const allContractCalls =
        events.length > 0 &&
        events.every(
          event => event.contract_call ?? event.contract_call_with_token
        );

      return toArray([
        linkField(
          'Poll',
          readString(message, 'poll_id'),
          id => `/evm-poll/${id}`
        ),
        accountField('Voter', readSender(message)),
        chainField('Chain', readString(vote ?? {}, 'chain')),
        // An empty event list is a vote that the event did not happen, which is
        // the one case where the absence is the whole point.
        textField(
          'Voted',
          events.length > 0
            ? `${events.length} event${events.length === 1 ? '' : 's'} confirmed`
            : 'No event found'
        ),
        hashField(
          // A poll covers a single source transaction, so every event in the
          // vote repeats the same tx_id. Duplicates would also collide on the
          // React key of the row.
          'Source transaction',
          [...new Set(events.flatMap(event => readHashes([event.tx_id])))],
          readString(vote ?? {}, 'chain'),
          allContractCalls
        ),
      ]);
    },
  },
  '/axelar.evm.v1beta1.ConfirmGatewayTxsRequest': {
    label: 'Start confirmation poll',
    extract: message =>
      toArray([
        chainField('Chain', readString(message, 'chain')),
        hashField(
          'Transactions',
          // The singular ConfirmGatewayTxRequest is still in use and carries
          // tx_id instead; both are read here.
          readHashes(message.tx_ids ?? [message.tx_id]),
          readString(message, 'chain'),
          true
        ),
        accountField('Sender', readSender(message)),
      ]),
  },
  '/axelar.evm.v1beta1.ConfirmGatewayTxRequest': {
    label: 'Start confirmation poll',
    extract: message =>
      toArray([
        chainField('Chain', readString(message, 'chain')),
        hashField(
          'Transaction',
          readHashes([message.tx_id]),
          readString(message, 'chain'),
          true
        ),
        accountField('Sender', readSender(message)),
      ]),
  },
  '/axelar.multisig.v1beta1.SubmitSignatureRequest': {
    label: 'Submit signature',
    extract: message =>
      toArray([
        textField('Signature ID', readString(message, 'sig_id')),
        accountField('Signer', readSender(message)),
      ]),
  },
  '/axelar.evm.v1beta1.SignCommandsRequest': {
    label: 'Sign commands',
    extract: message =>
      toArray([
        chainField('Chain', readString(message, 'chain')),
        accountField('Sender', readSender(message)),
      ]),
  },
  '/cosmwasm.wasm.v1.MsgExecuteContract': {
    label: 'Contract call',
    extract: message =>
      toArray([
        textField('Action', readContractAction(message)),
        accountField('Contract', readString(message, 'contract')),
        accountField('Sender', readSender(message)),
      ]),
  },
  '/axelar.axelarnet.v1beta1.RouteMessageRequest': {
    label: 'Route message',
    extract: message =>
      toArray([
        linkField('Message', readString(message, 'id'), id => `/gmp/${id}`),
        accountField('Sender', readSender(message)),
      ]),
  },

  // --- IBC packet lifecycle. The relayer signs these; the interesting part is
  // the packet they carry and, for an acknowledgement, whether it worked.
  '/ibc.core.channel.v1.MsgRecvPacket': {
    label: 'Receive IBC packet',
    extract: message => {
      const packet = readPacket(message);

      return toArray([
        textField('Sequence', packet.sequence),
        textField('Channel', packet.route),
        // The far side is a foreign address, so it is shown as plain text.
        textField('Sender', packet.sender),
        accountField('Receiver', packet.receiver),
        amountField('Amount', packet.amount),
        accountField('Relayer', readString(message, 'signer')),
      ]);
    },
  },
  '/ibc.core.channel.v1.MsgAcknowledgement': {
    label: 'Acknowledge IBC packet',
    extract: message => {
      const packet = readPacket(message);

      return toArray([
        textField('Result', readAcknowledgement(message)),
        textField('Sequence', packet.sequence),
        textField('Channel', packet.route),
        accountField('Sender', packet.sender),
        textField('Receiver', packet.receiver),
        amountField('Amount', packet.amount),
        accountField('Relayer', readString(message, 'signer')),
      ]);
    },
  },
  '/ibc.core.channel.v1.MsgTimeout': {
    label: 'IBC packet timed out',
    extract: message => {
      const packet = readPacket(message);

      return toArray([
        textField('Sequence', packet.sequence),
        textField('Channel', packet.route),
        accountField('Sender', packet.sender),
        textField('Receiver', packet.receiver),
        amountField('Amount', packet.amount),
        accountField('Relayer', readString(message, 'signer')),
      ]);
    },
  },

  // --- Messages a person is likely to have sent themselves.
  '/cosmos.bank.v1beta1.MsgSend': {
    label: 'Send',
    extract: message =>
      toArray([
        accountField('From', readString(message, 'from_address')),
        accountField('To', readString(message, 'to_address')),
        ...coinFields('Amount', message.amount),
      ]),
  },
  '/ibc.applications.transfer.v1.MsgTransfer': {
    label: 'IBC transfer',
    extract: message =>
      toArray([
        accountField('Sender', readString(message, 'sender')),
        textField('Receiver', readString(message, 'receiver')),
        amountField('Token', readAmount(message, 'token')),
        textField('Channel', readString(message, 'source_channel')),
      ]),
  },
  // Both gov versions are live, v1beta1 more often than v1, and the payload is
  // identical, so they share a handler.
  '/cosmos.gov.v1beta1.MsgVote': {
    label: 'Governance vote',
    extract: message =>
      toArray([
        linkField(
          'Proposal',
          readString(message, 'proposal_id'),
          id => `/proposal/${id}`
        ),
        accountField('Voter', readString(message, 'voter')),
        textField('Option', readVoteOption(readString(message, 'option'))),
      ]),
  },
  '/cosmos.gov.v1.MsgVote': {
    label: 'Governance vote',
    extract: message =>
      toArray([
        linkField(
          'Proposal',
          readString(message, 'proposal_id'),
          id => `/proposal/${id}`
        ),
        accountField('Voter', readString(message, 'voter')),
        textField('Option', readVoteOption(readString(message, 'option'))),
      ]),
  },
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': {
    label: 'Withdraw rewards',
    extract: message =>
      toArray([
        accountField('Delegator', readString(message, 'delegator_address')),
        validatorField('Validator', readString(message, 'validator_address')),
      ]),
  },
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
 * Wrappers that carry the real message inside them. RefundMsgRequest is the
 * envelope validators put their routine work in so the chain refunds their gas
 * (x/reward), and it accounts for nearly every transaction on Axelar - without
 * unwrapping, the registry would describe almost nothing.
 *
 * The wrapper's sender is the signer, and the inner message usually leaves its
 * own sender empty, so it is carried down.
 */
const UNWRAP_KEYS: Record<string, string> = {
  '/axelar.reward.v1beta1.RefundMsgRequest': 'inner_message',
  // BatchRequest carries an array instead, so one entry can yield several.
  '/axelar.auxiliary.v1beta1.BatchRequest': 'messages',
};

interface Unwrapped {
  message: Record<string, unknown>;
  wrappedIn?: string;
}

const unwrap = (message: Record<string, unknown>): Unwrapped[] => {
  const type = readString(message, '@type');
  const key =
    type && Object.prototype.hasOwnProperty.call(UNWRAP_KEYS, type)
      ? UNWRAP_KEYS[type]
      : undefined;
  const payload = key ? message[key] : undefined;

  if (!type || !payload) return [{ message }];

  const inner = (Array.isArray(payload) ? payload : [payload]).filter(
    (entry): entry is Record<string, unknown> =>
      Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry)
  );

  if (inner.length === 0) return [{ message }];

  return inner.map(entry => ({
    message: { ...entry, sender: readSender(entry) ?? readSender(message) },
    wrappedIn: shortMessageType(type),
  }));
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

    return unwrap(entry as Record<string, unknown>).flatMap(
      ({ message, wrappedIn }, innerIndex) =>
        describe(message, index, innerIndex, wrappedIn)
    );
  });
}

function describe(
  message: Record<string, unknown>,
  index: number,
  innerIndex: number,
  wrappedIn?: string
): MessageSummary[] {
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
      innerIndex,
      type: shortMessageType(type),
      label: handler.label,
      fields,
      ...(wrappedIn ? { wrappedIn } : {}),
    },
  ];
}
