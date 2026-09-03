/**
 * @jest-environment node
 */
import {
  extractMessageSummaries,
  shortMessageType,
  type MessageField,
} from './txMessages';

const addressOf = (fields: MessageField[], label: string) => {
  const field = fields.find(f => f.label === label);
  return field && field.kind !== 'amount' ? field.address : undefined;
};

const amountOf = (fields: MessageField[], label: string) => {
  const field = fields.find(f => f.label === label);
  return field?.kind === 'amount' ? field.amount : undefined;
};

// Verbatim from mainnet tx
// EBE3974D8AA27DA51C4F83A416A60DB0301548CEFB9733E3275C763523B441D8.
const redelegate = {
  '@type': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  delegator_address: 'axelar12dry54e2af8m7mvmr4vradgapk78g6mt0r9fds',
  validator_src_address: 'axelarvaloper17q4fqv86dxkes384tnmrvjr9ljp2slunr6k00w',
  validator_dst_address: 'axelarvaloper1qy9uq03rkpqkzwsa4fz7xxetkxttdcj6tf09pg',
  amount: { denom: 'uaxl', amount: '3999595000549' },
};

const wrap = (messages: unknown[]) => ({ tx: { body: { messages } } });

describe('extractMessageSummaries', () => {
  it('reads the four fields that matter out of a redelegation', () => {
    const [summary] = extractMessageSummaries(wrap([redelegate]));

    expect(summary).toEqual({
      index: 0,
      type: 'MsgBeginRedelegate',
      label: 'Redelegate',
      fields: [
        {
          label: 'Delegator',
          kind: 'account',
          address: 'axelar12dry54e2af8m7mvmr4vradgapk78g6mt0r9fds',
        },
        {
          label: 'From validator',
          kind: 'validator',
          address: 'axelarvaloper17q4fqv86dxkes384tnmrvjr9ljp2slunr6k00w',
        },
        {
          label: 'To validator',
          kind: 'validator',
          address: 'axelarvaloper1qy9uq03rkpqkzwsa4fz7xxetkxttdcj6tf09pg',
        },
        {
          label: 'Amount',
          kind: 'amount',
          amount: { denom: 'uaxl', amount: '3999595000549' },
        },
      ],
    });
  });

  it('keeps the source and destination validators the right way round', () => {
    const [summary] = extractMessageSummaries(wrap([redelegate]));
    expect(addressOf(summary.fields, 'From validator')).toBe(
      redelegate.validator_src_address
    );
    expect(addressOf(summary.fields, 'To validator')).toBe(
      redelegate.validator_dst_address
    );
  });

  it('marks validators apart from the delegator account', () => {
    // The two render differently: a validator needs the axelarvaloper prefix,
    // without which Profile links to /account instead of /validator.
    const [summary] = extractMessageSummaries(wrap([redelegate]));
    const kinds = Object.fromEntries(
      summary.fields.map(f => [f.label, f.kind])
    );

    expect(kinds).toEqual({
      Delegator: 'account',
      'From validator': 'validator',
      'To validator': 'validator',
      Amount: 'amount',
    });
  });

  it('handles delegate and undelegate, which name the validator differently', () => {
    const delegate = {
      '@type': '/cosmos.staking.v1beta1.MsgDelegate',
      delegator_address: 'axelar1delegator',
      validator_address: 'axelarvaloper1target',
      amount: { denom: 'uaxl', amount: '1000000' },
    };

    expect(extractMessageSummaries(wrap([delegate]))[0]).toMatchObject({
      label: 'Delegate',
      fields: [
        { label: 'Delegator', kind: 'account', address: 'axelar1delegator' },
        {
          label: 'Validator',
          kind: 'validator',
          address: 'axelarvaloper1target',
        },
        {
          label: 'Amount',
          kind: 'amount',
          amount: { denom: 'uaxl', amount: '1000000' },
        },
      ],
    });

    expect(
      extractMessageSummaries(
        wrap([
          { ...delegate, '@type': '/cosmos.staking.v1beta1.MsgUndelegate' },
        ])
      )[0]
    ).toMatchObject({ label: 'Undelegate' });
  });

  it('numbers each message so one transaction can carry several', () => {
    const summaries = extractMessageSummaries(
      wrap([redelegate, { '@type': 'unknown' }, redelegate])
    );

    // The unrecognised message is skipped, but the index still points at the
    // real position in tx.body.messages.
    expect(summaries.map(s => s.index)).toEqual([0, 2]);
  });

  it('skips message types it does not know', () => {
    expect(
      extractMessageSummaries(
        wrap([{ '@type': '/cosmos.bank.v1beta1.MsgSend', amount: [] }])
      )
    ).toEqual([]);
  });

  it('skips a recognised message with nothing readable in it', () => {
    // Better to show nothing than a row of empty labels; the JSON is below.
    expect(
      extractMessageSummaries(
        wrap([{ '@type': '/cosmos.staking.v1beta1.MsgDelegate' }])
      )
    ).toEqual([]);
  });

  it('survives malformed input rather than throwing', () => {
    expect(extractMessageSummaries(undefined)).toEqual([]);
    expect(extractMessageSummaries(null)).toEqual([]);
    expect(extractMessageSummaries({})).toEqual([]);
    expect(extractMessageSummaries(wrap([null, 'a string', 42]))).toEqual([]);
    expect(
      extractMessageSummaries({ tx: { body: { messages: 'nope' } } })
    ).toEqual([]);
  });

  it('ignores an amount that is not the expected shape', () => {
    const noAmount = extractMessageSummaries(
      wrap([{ ...redelegate, amount: { denom: 'uaxl' } }])
    )[0];

    expect(noAmount.fields.map(f => f.label)).not.toContain('Amount');
    // The addresses still come through.
    expect(noAmount.fields).toHaveLength(3);
  });

  it('drops an amount that has no denom, which would render without a unit', () => {
    const [summary] = extractMessageSummaries(
      wrap([{ ...redelegate, amount: { amount: '5' } }])
    );

    expect(amountOf(summary.fields, 'Amount')).toBeUndefined();
  });

  it('drops a non-numeric amount rather than letting it reach formatUnits', () => {
    // formatUnits throws on input it cannot parse, and there is no error
    // boundary above this - it would blank the whole transaction page.
    for (const bad of ['abc', '', '1.2.3', '0x10', ' 5']) {
      const [summary] = extractMessageSummaries(
        wrap([{ ...redelegate, amount: { denom: 'uaxl', amount: bad } }])
      );
      expect(amountOf(summary.fields, 'Amount')).toBeUndefined();
    }

    expect(
      amountOf(extractMessageSummaries(wrap([redelegate]))[0].fields, 'Amount')
    ).toEqual({ denom: 'uaxl', amount: '3999595000549' });
  });

  it('does not resolve an @type off Object.prototype', () => {
    for (const bad of ['constructor', '__proto__', 'toString', 'valueOf']) {
      expect(extractMessageSummaries(wrap([{ '@type': bad }]))).toEqual([]);
    }
  });

  it('keeps the raw position when an earlier message is blank', () => {
    // The index has to match the raw JSON below, so blanks must not shift it.
    const summaries = extractMessageSummaries(wrap([null, redelegate]));

    expect(summaries.map(s => s.index)).toEqual([1]);
  });
});

describe('shortMessageType', () => {
  it('takes the last segment of the type url', () => {
    expect(shortMessageType('/cosmos.staking.v1beta1.MsgBeginRedelegate')).toBe(
      'MsgBeginRedelegate'
    );
  });

  it('returns the input unchanged when there is nothing to strip', () => {
    expect(shortMessageType('MsgDelegate')).toBe('MsgDelegate');
  });
});
