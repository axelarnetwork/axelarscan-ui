/**
 * @jest-environment node
 */
import { ConfirmGatewayTxRequest } from '@axelar-network/axelarjs-types/axelar/evm/v1beta1/tx';
import { utils } from 'ethers';

// Turbopack gives the browser no Buffer global. @axelar-network/axelarjs-types
// defaults every protobuf bytes field to Buffer.alloc(0) and ships no browser
// build, so without the polyfill the self-signed confirm flow throws
// "Buffer is not defined" before it can build the message.
describe('Buffer polyfill', () => {
  const realBuffer = globalThis.Buffer;

  afterEach(() => {
    globalThis.Buffer = realBuffer;
    jest.resetModules();
  });

  const buildConfirmRequest = () =>
    ConfirmGatewayTxRequest.fromPartial({
      sender: 'axelar1sender',
      chain: 'ethereum',
      // axelarjs-types declares bytes fields as Buffer; the writer only ever
      // reads them as bytes, which is exactly what the SDK now passes.
      txId: utils.arrayify(`0x${'ab'.repeat(32)}`) as unknown as Buffer,
    });

  it('is what makes ConfirmGatewayTxRequest constructible without the global', async () => {
    // @ts-expect-error - simulate the browser bundle
    delete globalThis.Buffer;
    expect(buildConfirmRequest).toThrow('Buffer is not defined');

    await import('./bufferPolyfill');

    expect(typeof globalThis.Buffer).toBe('function');
    expect(Array.from(buildConfirmRequest().txId)).toHaveLength(32);
  });

  it('leaves an existing Buffer global alone', async () => {
    // Assert against a sentinel, not against Node's own Buffer. Under the node
    // test env `import { Buffer } from 'buffer'` resolves to the builtin, so
    // comparing to the builtin would pass even with the guard removed.
    const sentinel = {} as unknown as typeof globalThis.Buffer;
    globalThis.Buffer = sentinel;

    await import('./bufferPolyfill');

    expect(globalThis.Buffer).toBe(sentinel);
  });
});
