import { Buffer as BufferPolyfill } from 'buffer';

/**
 * Provide a `Buffer` global in the browser.
 *
 * Next 16 defaults to Turbopack, which - unlike the webpack config it replaced -
 * does not inject a `Buffer` global, and there is no ProvidePlugin equivalent.
 * Most of our dependencies cope: @solana/web3.js imports Buffer from the
 * `buffer` package explicitly, and ethers ships browser builds that avoid it.
 *
 * @axelar-network/axelarjs-types does not. Every generated protobuf message
 * defaults its bytes fields to `Buffer.alloc(0)` - 42 files' worth - and the
 * package has no browser build. So `ConfirmGatewayTxRequest.fromPartial(...)`
 * throws "Buffer is not defined" in the browser, which takes out the
 * self-signed confirm and route-message flows.
 *
 * We cannot fix that package from here, so polyfill the global instead. Import
 * this once, from a client component, before anything touches the SDK.
 */
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = BufferPolyfill as unknown as typeof globalThis.Buffer;
}

export {};
