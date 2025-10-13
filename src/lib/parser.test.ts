/**
 * @jest-environment node
 */
import {
  base64ToString,
  getIBCDenomBase64,
  getIcapAddress,
  getInputType,
  getValuesOfAxelarAddressKey,
  objToQS,
  parseError,
  split,
  toArray,
  toCase,
  toHex,
  toJson,
} from './parser';

describe('parser utilities', () => {
  describe('objToQS', () => {
    it('should convert object to query string', () => {
      expect(objToQS({ name: 'John', age: 30 })).toBe('?name=John&age=30');
      expect(objToQS({ foo: 'bar' })).toBe('?foo=bar');
    });

    it('should filter out null and undefined values', () => {
      expect(objToQS({ foo: 'bar', baz: null })).toBe('?foo=bar');
      expect(objToQS({ a: 1, b: undefined, c: 2 })).toBe('?a=1&c=2');
      expect(objToQS({ foo: null })).toBe('');
    });

    it('should return empty string for empty objects', () => {
      expect(objToQS({})).toBe('');
    });

    it('should encode special characters', () => {
      expect(objToQS({ msg: 'hello world' })).toBe('?msg=hello%20world');
      expect(objToQS({ url: 'a&b=c' })).toBe('?url=a%26b%3Dc');
    });

    it('should handle numeric values', () => {
      expect(objToQS({ count: 42 })).toBe('?count=42');
      expect(objToQS({ price: 19.99 })).toBe('?price=19.99');
    });

    it('should handle boolean values', () => {
      expect(objToQS({ active: true })).toBe('?active=true');
      expect(objToQS({ enabled: false })).toBe('?enabled=false');
    });
  });

  describe('getIcapAddress', () => {
    it('should checksum Ethereum addresses', () => {
      const result = getIcapAddress('0xabc123');
      expect(typeof result).toBe('string');
      expect((result as string).startsWith('0x')).toBe(true);
    });

    it('should return non-Ethereum addresses unchanged', () => {
      expect(getIcapAddress('axelar123')).toBe('axelar123');
      expect(getIcapAddress('cosmos1abc')).toBe('cosmos1abc');
    });

    it('should return non-string values unchanged', () => {
      expect(getIcapAddress(123)).toBe(123);
      expect(getIcapAddress(null)).toBe(null);
    });

    it('should handle invalid Ethereum addresses gracefully', () => {
      const result = getIcapAddress('0xinvalid');
      expect(result).toBe('0xinvalid');
    });
  });

  describe('base64ToString', () => {
    it('should decode base64 strings', () => {
      expect(base64ToString('SGVsbG8=')).toBe('Hello');
      expect(base64ToString('V29ybGQ=')).toBe('World');
    });

    it('should return original string if decoding fails', () => {
      expect(base64ToString('invalid')).toBe('invalid');
      expect(base64ToString('notbase64')).toBe('notbase64');
    });

    it('should handle empty strings', () => {
      expect(base64ToString('')).toBe('');
    });
  });

  describe('getIBCDenomBase64', () => {
    it('should extract and encode last part of IBC path', () => {
      const result = getIBCDenomBase64('transfer/channel-0/uaxl');
      expect(result).toBe(Buffer.from('uaxl').toString('base64'));
      expect(result).toBe('dWF4bA==');
    });

    it('should handle simple strings', () => {
      const result = getIBCDenomBase64('uaxl');
      expect(result).toBe(Buffer.from('uaxl').toString('base64'));
      expect(result).toBe('dWF4bA==');
    });

    it('should return original value on error or encode if possible', () => {
      expect(getIBCDenomBase64(null)).toBe(null);
      // For number 123, it converts to string '123', which gets base64 encoded
      const result = getIBCDenomBase64(123);
      expect(result).toBe(Buffer.from('123').toString('base64'));
      expect(result).toBe('MTIz');
    });

    it('should handle empty paths', () => {
      const result = getIBCDenomBase64('');
      // Empty string has no parts, returns original
      expect(result).toBe('');
    });

    it('should encode non-empty simple strings', () => {
      const result = getIBCDenomBase64('test');
      const expected = Buffer.from('test').toString('base64');
      expect(result).toBe(expected);
      expect(result).toBe('dGVzdA==');
      // Verify it decodes back correctly
      expect(Buffer.from(result as string, 'base64').toString()).toBe('test');
    });

    it('should handle error by returning original value', () => {
      // Create a value that might cause Buffer.from to throw
      const weirdValue = {
        toString: () => {
          throw new Error('test');
        },
      };
      expect(getIBCDenomBase64(weirdValue)).toBe(weirdValue);
    });
  });

  describe('getInputType', () => {
    const mockChains = [
      { id: 'osmosis', prefix_address: 'osmo' },
      { id: 'cosmos', prefix_address: 'cosmos' },
    ];

    it('should detect transaction hashes', () => {
      const txHash = '0x' + 'a'.repeat(64);
      expect(getInputType(txHash, mockChains)).toBe('txhash');
    });

    it('should detect EVM addresses', () => {
      expect(getInputType('0x' + 'a'.repeat(40), mockChains)).toBe(
        'evmAddress'
      );
    });

    it('should detect validator addresses', () => {
      expect(getInputType('axelarvaloper1abc', mockChains)).toBe('validator');
    });

    it('should detect axelar addresses', () => {
      expect(getInputType('axelar1abc', mockChains)).toBe('axelarAddress');
    });

    it('should detect cosmos addresses with proper prefix', () => {
      expect(getInputType('osmo1abc123', mockChains)).toBe('cosmosAddress');
      expect(getInputType('cosmos1xyz789', mockChains)).toBe('cosmosAddress');
    });

    it('should detect block numbers', () => {
      expect(getInputType('123456', mockChains)).toBe('block');
      expect(getInputType(789, mockChains)).toBe('block');
    });

    it('should default to "tx" for unmatched strings', () => {
      expect(getInputType('randomstring', mockChains)).toBe('tx');
      expect(getInputType('abc123xyz', mockChains)).toBe('tx');
    });

    it('should detect domain names', () => {
      expect(getInputType('example.com', mockChains)).toBe('domainName');
      expect(getInputType('test.eth', mockChains)).toBe('domainName');
    });

    it('should return undefined for empty input', () => {
      expect(getInputType('', mockChains)).toBeUndefined();
      expect(getInputType(0, mockChains)).toBeUndefined();
    });
  });

  describe('toJson', () => {
    it('should parse valid JSON strings', () => {
      expect(toJson('{"name":"John"}')).toEqual({ name: 'John' });
      expect(toJson('{"a":1,"b":2}')).toEqual({ a: 1, b: 2 });
    });

    it('should handle unquoted object notation', () => {
      const result = toJson('{key:value}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle unquoted multi-property objects', () => {
      const result = toJson('{name:John,age:30}');
      expect(result).toEqual({ name: 'John', age: '30' });
    });

    it('should return object as is if already an object', () => {
      const obj = { foo: 'bar' };
      expect(toJson(obj)).toBe(obj);
    });

    it('should return null for invalid JSON', () => {
      expect(toJson('invalid')).toBeNull();
      expect(toJson('{incomplete')).toBeNull();
    });

    it('should return null for empty input', () => {
      expect(toJson('')).toBeNull();
      expect(toJson(null)).toBeNull();
      expect(toJson(undefined)).toBeNull();
    });

    it('should support generic types', () => {
      interface User {
        name: string;
      }
      const result = toJson<User>('{"name":"John"}');
      expect(result).toEqual({ name: 'John' });
    });

    it('should handle unquoted objects with numeric values', () => {
      // Test the non-string part case (line 264)
      const result = toJson('{count:42}');
      expect(result).toBeTruthy();
      // Note: May parse as string '42' since unquoted
    });

    it('should handle complex unquoted objects', () => {
      const result = toJson('{a:b,c:d}');
      expect(result).toEqual({ a: 'b', c: 'd' });
    });
  });

  describe('toHex', () => {
    it('should convert byte array to hex', () => {
      expect(toHex([255, 16, 32])).toBe('0xff1020');
      expect(toHex([0, 0, 0])).toBe('0x000000');
    });

    it('should handle JSON string arrays', () => {
      expect(toHex('[255,16,32]')).toBe('0xff1020');
    });

    it('should return hex strings unchanged', () => {
      expect(toHex('0x123')).toBe('0x123');
      expect(toHex('abc')).toBe('abc');
    });

    it('should handle empty arrays', () => {
      expect(toHex([])).toBe('0x');
    });

    it('should handle single bytes', () => {
      expect(toHex([255])).toBe('0xff');
      expect(toHex([0])).toBe('0x00');
      expect(toHex([15])).toBe('0x0f');
    });
  });

  describe('toCase', () => {
    it('should convert to uppercase', () => {
      expect(toCase('hello', 'upper')).toBe('HELLO');
      expect(toCase('world', 'upper')).toBe('WORLD');
    });

    it('should convert to lowercase', () => {
      expect(toCase('HELLO', 'lower')).toBe('hello');
      expect(toCase('WORLD', 'lower')).toBe('world');
    });

    it('should return string unchanged for "normal" case', () => {
      expect(toCase('Hello', 'normal')).toBe('Hello');
      expect(toCase('TeSt')).toBe('TeSt'); // default is 'normal'
    });

    it('should trim whitespace', () => {
      expect(toCase('  hello  ', 'upper')).toBe('HELLO');
      expect(toCase('  world  ', 'lower')).toBe('world');
    });

    it('should return non-string values unchanged', () => {
      expect(toCase(123, 'upper')).toBe(123);
      expect(toCase(null, 'lower')).toBe(null);
      expect(toCase(true, 'upper')).toBe(true);
    });

    it('should use generic type preservation', () => {
      const num = 42;
      const result = toCase(num, 'upper');
      expect(result).toBe(42);
    });
  });

  describe('split', () => {
    it('should split by default comma delimiter', () => {
      expect(split('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should split by custom delimiter', () => {
      expect(split('hello-world', { delimiter: '-' })).toEqual([
        'hello',
        'world',
      ]);
      expect(split('a|b|c', { delimiter: '|' })).toEqual(['a', 'b', 'c']);
    });

    it('should apply case conversion', () => {
      expect(split('A,B,C', { toCase: 'lower' })).toEqual(['a', 'b', 'c']);
      expect(split('a,b,c', { toCase: 'upper' })).toEqual(['A', 'B', 'C']);
    });

    it('should filter blank entries by default', () => {
      expect(split('a,,c')).toEqual(['a', 'c']);
      expect(split('a,b,')).toEqual(['a', 'b']);
      expect(split(',a,b')).toEqual(['a', 'b']);
    });

    it('should keep blank entries when filterBlank is false', () => {
      expect(split('a,,c', { filterBlank: false })).toEqual(['a', '', 'c']);
    });

    it('should handle non-string values', () => {
      expect(split(123)).toEqual(['123']);
      expect(split(true)).toEqual(['true']);
    });

    it('should handle null and undefined', () => {
      expect(split(null)).toEqual([]);
      expect(split(undefined)).toEqual([]);
    });

    it('should handle empty strings', () => {
      expect(split('')).toEqual([]);
      expect(split('', { filterBlank: false })).toEqual(['']);
    });
  });

  describe('toArray', () => {
    it('should convert comma-delimited strings to arrays', () => {
      expect(toArray('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should return arrays unchanged', () => {
      expect(toArray(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('should handle custom delimiters', () => {
      expect(toArray('a-b-c', { delimiter: '-' })).toEqual(['a', 'b', 'c']);
    });

    it('should apply case conversion to arrays', () => {
      expect(toArray(['A', 'B'], { toCase: 'lower' })).toEqual(['a', 'b']);
    });

    it('should handle single values', () => {
      expect(toArray('single')).toEqual(['single']);
    });

    it('should handle null and undefined', () => {
      expect(toArray(null)).toEqual([]);
      expect(toArray(undefined)).toEqual([]);
    });

    it('should filter blank entries', () => {
      expect(toArray(['a', '', 'c'])).toEqual(['a', 'c']);
      expect(toArray(['a', '', 'c'], { filterBlank: false })).toEqual([
        'a',
        '',
        'c',
      ]);
    });
  });

  describe('parseError', () => {
    it('should extract message from error object', () => {
      const result = parseError({ message: 'Network error' });
      expect(result.message).toBe('Network error');
      expect(result.code).toBe('network_error');
    });

    it('should prioritize reason over message', () => {
      const result = parseError({
        reason: 'User rejected',
        message: 'Other error',
      });
      expect(result.message).toBe('User Rejected'); // Special handling
      expect(result.code).toBe('user_rejected');
    });

    it('should extract from data.message', () => {
      const result = parseError({
        data: { message: 'Transaction failed' },
      });
      expect(result.message).toBe('Transaction failed');
      expect(result.code).toBe('transaction_failed');
    });

    it('should extract from data.text', () => {
      const result = parseError({
        data: { text: 'Error text' },
      });
      expect(result.message).toBe('Error text');
      expect(result.code).toBe('error_text');
    });

    it('should handle string errors', () => {
      const result = parseError('Something failed');
      expect(result.message).toBe('Something failed');
      expect(result.code).toBe('something_failed');
    });

    it('should handle ACTION_REJECTED', () => {
      const result = parseError({ message: 'ACTION_REJECTED by user' });
      expect(result.message).toBe('User Rejected');
    });

    it('should generate code from first two words', () => {
      const result = parseError({
        message: 'Connection timeout error occurred',
      });
      expect(result.code).toBe('connection_timeout');
    });

    it('should handle single word messages', () => {
      const result = parseError({ message: 'Error' });
      expect(result.code).toBe('error');
    });
  });

  describe('getValuesOfAxelarAddressKey', () => {
    it('should extract values with axelar-prefixed keys', () => {
      const data = {
        axelar1: 'addr1',
        axelar2: 'addr2',
        other: 'value',
      };
      expect(getValuesOfAxelarAddressKey(data)).toEqual(['addr1', 'addr2']);
    });

    it('should filter out falsy values', () => {
      const data = {
        axelar1: 'addr1',
        axelar2: null,
        axelar3: '',
        axelar4: 'addr4',
      };
      const result = getValuesOfAxelarAddressKey(data);
      expect(result).toContain('addr1');
      expect(result).toContain('addr4');
      expect(result).not.toContain(null);
      expect(result).not.toContain('');
    });

    it('should return empty array if no axelar keys', () => {
      expect(getValuesOfAxelarAddressKey({ foo: 'bar' })).toEqual([]);
    });

    it('should return empty array for empty object', () => {
      expect(getValuesOfAxelarAddressKey({})).toEqual([]);
    });

    it('should handle mixed case in keys', () => {
      const data = {
        axelarAddress: 'addr1',
        AxelarOther: 'addr2', // Doesn't start with 'axelar' (capital A)
      };
      expect(getValuesOfAxelarAddressKey(data)).toEqual(['addr1']);
    });
  });

  describe('toCase', () => {
    it('should handle various string inputs', () => {
      expect(toCase('  test  ', 'upper')).toBe('TEST');
      expect(toCase('  TEST  ', 'lower')).toBe('test');
      expect(toCase('  Mixed  ')).toBe('Mixed');
    });

    it('should preserve type for non-strings', () => {
      const obj = { foo: 'bar' };
      expect(toCase(obj, 'upper')).toBe(obj);
    });
  });

  describe('split', () => {
    it('should handle single character strings', () => {
      expect(split('a')).toEqual(['a']);
    });

    it('should handle strings without delimiter', () => {
      expect(split('hello', { delimiter: '-' })).toEqual(['hello']);
    });

    it('should handle numbers', () => {
      expect(split(42)).toEqual(['42']);
    });

    it('should handle booleans', () => {
      expect(split(true)).toEqual(['true']);
      expect(split(false)).toEqual(['false']);
    });
  });

  describe('toArray', () => {
    it('should handle numbers', () => {
      expect(toArray(123)).toEqual(['123']);
    });

    it('should handle booleans', () => {
      expect(toArray(true)).toEqual(['true']);
    });

    it('should preserve array element types when possible', () => {
      const numbers = [1, 2, 3];
      const result = toArray(numbers);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('toHex', () => {
    it('should handle large byte values', () => {
      expect(toHex([255, 255, 255])).toBe('0xffffff');
    });

    it('should handle mixed byte values', () => {
      expect(toHex([0, 127, 255])).toBe('0x007fff');
    });

    it('should handle non-array non-string values', () => {
      expect(toHex(123)).toBe('0x');
    });
  });
});
