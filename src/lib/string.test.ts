/**
 * @jest-environment node
 */
import {
  camel,
  capitalize,
  ellipse,
  equalsIgnoreCase,
  filterSearchInput,
  find,
  headString,
  includesSomePatterns,
  isString,
  lastString,
  removeDoubleQuote,
  removeHexPrefix,
  toBoolean,
  toTitle,
} from './string';

describe('string utilities', () => {
  describe('isString', () => {
    it('should return true for string values', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString('123')).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(true)).toBe(false);
    });
  });

  describe('equalsIgnoreCase', () => {
    it('should return true for equal strings ignoring case', () => {
      expect(equalsIgnoreCase('Hello', 'hello')).toBe(true);
      expect(equalsIgnoreCase('ABC', 'abc')).toBe(true);
      expect(equalsIgnoreCase('test', 'TEST')).toBe(true);
    });

    it('should return true when both values are falsy', () => {
      expect(equalsIgnoreCase(null, null)).toBe(true);
      expect(equalsIgnoreCase(undefined, undefined)).toBe(true);
      expect(equalsIgnoreCase(null, undefined)).toBe(true);
      expect(equalsIgnoreCase('', '')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(equalsIgnoreCase('hello', 'world')).toBe(false);
      expect(equalsIgnoreCase('abc', 'def')).toBe(false);
    });

    it('should return false when only one is falsy', () => {
      expect(equalsIgnoreCase('hello', null)).toBe(false);
      expect(equalsIgnoreCase(null, 'world')).toBe(false);
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first character', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
      expect(capitalize('a')).toBe('A');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should return empty string for non-string values', () => {
      expect(capitalize(123)).toBe('');
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
      expect(capitalize({})).toBe('');
    });

    it('should handle strings with special characters', () => {
      expect(capitalize('123abc')).toBe('123abc');
      expect(capitalize('!hello')).toBe('!hello');
    });
  });

  describe('camel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(camel('hello_world')).toBe('helloWorld');
      expect(camel('foo_bar_baz')).toBe('fooBarBaz');
      expect(camel('test_case')).toBe('testCase');
    });

    it('should handle custom delimiters', () => {
      expect(camel('hello-world', '-')).toBe('helloWorld');
      expect(camel('foo.bar.baz', '.')).toBe('fooBarBaz');
    });

    it('should handle single words', () => {
      expect(camel('hello')).toBe('hello');
      expect(camel('world', '-')).toBe('world');
    });

    it('should handle empty strings', () => {
      expect(camel('')).toBe('');
    });
  });

  describe('removeDoubleQuote', () => {
    it('should remove double quotes from strings', () => {
      expect(removeDoubleQuote('"hello"')).toBe('hello');
      expect(removeDoubleQuote('say "hi"')).toBe('sayhi'); // Note: splits by quotes, removes all quotes
      expect(removeDoubleQuote('"test"')).toBe('test');
    });

    it('should handle strings without quotes', () => {
      expect(removeDoubleQuote('hello')).toBe('hello');
      expect(removeDoubleQuote('')).toBe('');
    });

    it('should return non-string values unchanged', () => {
      expect(removeDoubleQuote(123)).toBe(123);
      expect(removeDoubleQuote(null)).toBe(null);
      expect(removeDoubleQuote(true)).toBe(true);
    });

    it('should handle multiple quotes', () => {
      expect(removeDoubleQuote('""hello""')).toBe('hello');
      expect(removeDoubleQuote('"a""b""c"')).toBe('abc');
    });

    it('should split by quotes and join (removes spaces in quotes too)', () => {
      // Splits by '"', resulting in ['', 'hello', ' ', 'world', ''], then joins
      expect(removeDoubleQuote('"hello" "world"')).toBe('helloworld');
    });
  });

  describe('removeHexPrefix', () => {
    it('should remove 0x prefix from hex strings', () => {
      expect(removeHexPrefix('0x1234abcd')).toBe('1234abcd');
      expect(removeHexPrefix('0xABCDEF')).toBe('ABCDEF');
      expect(removeHexPrefix('0x0')).toBe('0');
    });

    it('should return string unchanged if no 0x prefix', () => {
      expect(removeHexPrefix('1234abcd')).toBe('1234abcd');
      expect(removeHexPrefix('hello')).toBe('hello');
      expect(removeHexPrefix('')).toBe('');
    });

    it('should return non-string values unchanged', () => {
      expect(removeHexPrefix(123)).toBe(123);
      expect(removeHexPrefix(null)).toBe(null);
      expect(removeHexPrefix({})).toEqual({});
    });
  });

  describe('toBoolean', () => {
    it('should convert "true" string to boolean', () => {
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('TRUE')).toBe(true);
      expect(toBoolean('True')).toBe(true);
    });

    it('should convert "false" string to boolean', () => {
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('FALSE')).toBe(false);
      expect(toBoolean('False')).toBe(false);
    });

    it('should handle boolean values', () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);
    });

    it('should use default value for non-boolean, non-string values', () => {
      expect(toBoolean(123)).toBe(true);
      expect(toBoolean(null)).toBe(true);
      expect(toBoolean(undefined)).toBe(true);
      expect(toBoolean(123, false)).toBe(false);
      expect(toBoolean(null, false)).toBe(false);
    });

    it('should handle any string that is not "true" as false', () => {
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('anything')).toBe(false);
      expect(toBoolean('1')).toBe(false);
      expect(toBoolean('yes')).toBe(false);
    });
  });

  describe('headString', () => {
    it('should return the first part of a delimited string', () => {
      expect(headString('hello-world-foo')).toBe('hello');
      expect(headString('a-b-c', '-')).toBe('a');
      expect(headString('one_two', '_')).toBe('one');
    });

    it('should handle single-part strings', () => {
      expect(headString('hello')).toBe('hello');
      expect(headString('single', '-')).toBe('single');
    });

    it('should return undefined for empty strings', () => {
      expect(headString('')).toBeUndefined();
    });

    it('should handle custom delimiters', () => {
      expect(headString('a.b.c', '.')).toBe('a');
      expect(headString('x|y|z', '|')).toBe('x');
    });

    it('should handle non-string values', () => {
      expect(headString(123)).toBe('123');
      expect(headString(null)).toBeUndefined();
    });
  });

  describe('lastString', () => {
    it('should return the last part of a delimited string', () => {
      expect(lastString('hello-world-foo')).toBe('foo');
      expect(lastString('a-b-c', '-')).toBe('c');
      expect(lastString('one_two', '_')).toBe('two');
    });

    it('should handle single-part strings', () => {
      expect(lastString('hello')).toBe('hello');
      expect(lastString('single', '-')).toBe('single');
    });

    it('should return undefined for empty strings', () => {
      expect(lastString('')).toBeUndefined();
    });

    it('should handle custom delimiters', () => {
      expect(lastString('a.b.c', '.')).toBe('c');
      expect(lastString('x|y|z', '|')).toBe('z');
    });

    it('should handle non-string values', () => {
      expect(lastString(123)).toBe('123');
      expect(lastString(null)).toBeUndefined();
    });
  });

  describe('find', () => {
    it('should find matching element case-insensitively', () => {
      expect(find('hello', ['Hello', 'World'])).toBe('Hello');
      expect(find('WORLD', ['hello', 'world'])).toBe('world');
      expect(find('test', ['Test', 'TEST', 'TeSt'])).toBe('Test');
    });

    it('should return undefined if not found', () => {
      expect(find('foo', ['bar', 'baz'])).toBeUndefined();
      expect(find('missing', ['a', 'b', 'c'])).toBeUndefined();
    });

    it('should handle empty arrays', () => {
      expect(find('hello', [])).toBeUndefined();
    });

    it('should match exact case too', () => {
      expect(find('hello', ['hello', 'world'])).toBe('hello');
    });
  });

  describe('includesSomePatterns', () => {
    it('should return true if any pattern is found in string', () => {
      expect(includesSomePatterns('hello world', ['world'])).toBe(true);
      expect(includesSomePatterns('hello world', ['llo'])).toBe(true);
    });

    it('should work with array of strings', () => {
      expect(includesSomePatterns(['foo', 'bar'], ['ar'])).toBe(true);
      expect(includesSomePatterns(['apple', 'banana'], ['ana'])).toBe(true);
    });

    it('should return false if no pattern is found', () => {
      expect(includesSomePatterns('hello', ['world', 'foo'])).toBe(false);
      expect(includesSomePatterns(['a', 'b'], ['c', 'd'])).toBe(false);
    });

    it('should handle multiple patterns', () => {
      expect(includesSomePatterns('hello world', ['xyz', 'llo', 'abc'])).toBe(
        true
      );
      expect(includesSomePatterns('test', ['x', 'y', 'z'])).toBe(false);
    });

    it('should handle empty patterns', () => {
      expect(includesSomePatterns('hello', [])).toBe(false);
    });

    it('should handle single pattern string', () => {
      expect(includesSomePatterns('hello world', 'world')).toBe(true);
      expect(includesSomePatterns('hello', 'xyz')).toBe(false);
    });
  });

  describe('ellipse', () => {
    it('should truncate long strings with ellipsis in middle', () => {
      // Without prefix parameter, '0x' is treated as part of string
      expect(ellipse('0x1234567890abcdef', 4)).toBe('0x12...cdef');
      expect(ellipse('verylongaddress123456789', 5)).toBe('veryl...56789');
    });

    it('should return original string if short enough', () => {
      expect(ellipse('short')).toBe('short');
      expect(ellipse('hello', 10)).toBe('hello');
      expect(ellipse('test', 5)).toBe('test');
    });

    it('should handle prefix parameter correctly', () => {
      // With prefix, it removes prefix, truncates, then adds prefix back
      expect(ellipse('0x1234567890abcdef', 4, '0x')).toBe('0x1234...cdef');
      expect(ellipse('0x123456789', 3, '0x')).toBe('0x123...789');
    });

    it('should return empty string for non-string or empty values', () => {
      expect(ellipse(null)).toBe('');
      expect(ellipse(undefined)).toBe('');
      expect(ellipse(123)).toBe('');
      expect(ellipse('')).toBe('');
    });

    it('should handle custom length parameter', () => {
      expect(ellipse('1234567890abcdefghij', 2)).toBe('12...ij');
      // For length=8, takes 8 from each end
      expect(ellipse('1234567890abcdefghij', 8)).toBe('12345678...cdefghij');
    });

    it('should calculate threshold correctly (length * 2 + 3)', () => {
      // With length=5, threshold is 5*2+3=13
      expect(ellipse('12345678901234', 5)).toBe('12345...01234'); // 14 chars, > threshold, truncate
      expect(ellipse('1234567890123', 5)).toBe('12345...90123'); // 13 chars, NOT < threshold, truncate
      expect(ellipse('123456789012', 5)).toBe('123456789012'); // 12 chars, < threshold, no truncate
    });

    it('should preserve prefix when string has it', () => {
      expect(
        ellipse('https://example.com/very/long/path', 5, 'https://')
      ).toContain('https://');
    });

    it('should work without prefix even if string starts with it', () => {
      expect(ellipse('0xabcdefghijklmnop', 4)).toBe('0xab...mnop');
    });
  });

  describe('toTitle', () => {
    it('should convert delimited string to space-separated', () => {
      expect(toTitle('hello_world')).toBe('hello world');
      expect(toTitle('foo_bar_baz')).toBe('foo bar baz');
    });

    it('should capitalize when requested', () => {
      expect(toTitle('hello_world', '_', true)).toBe('Hello World');
      expect(toTitle('foo-bar', '-', true)).toBe('Foo Bar');
    });

    it('should handle custom delimiters', () => {
      expect(toTitle('foo-bar', '-')).toBe('foo bar');
      expect(toTitle('a.b.c', '.')).toBe('a b c');
    });

    it('should join without space when noSpace is true', () => {
      expect(toTitle('snake_case', '_', true, true)).toBe('SnakeCase');
      expect(toTitle('hello-world', '-', false, true)).toBe('helloworld');
    });

    it('should handle single words', () => {
      expect(toTitle('hello')).toBe('hello');
      expect(toTitle('test', '_', true)).toBe('Test');
    });
  });

  describe('filterSearchInput', () => {
    it('should return true for empty pattern', () => {
      expect(filterSearchInput('anything', '')).toBe(true);
      expect(filterSearchInput(['a', 'b'], '')).toBe(true);
      expect(filterSearchInput('test', null)).toBe(true);
    });

    it('should use includes for patterns longer than 2 characters', () => {
      expect(filterSearchInput(['apple', 'banana'], 'ban')).toBe(true);
      expect(filterSearchInput('hello world', 'wor')).toBe(true);
      expect(filterSearchInput(['foo', 'bar'], 'xyz')).toBe(false);
    });

    it('should use startsWith for patterns of 2 or fewer characters', () => {
      expect(filterSearchInput(['apple', 'banana'], 'ap')).toBe(true);
      expect(filterSearchInput(['apple', 'banana'], 'ba')).toBe(true);
      expect(filterSearchInput(['apple', 'banana'], 'ch')).toBe(false);
    });

    it('should be case-insensitive for startsWith', () => {
      expect(filterSearchInput(['Apple', 'Banana'], 'ap')).toBe(true);
      expect(filterSearchInput(['HELLO'], 'he')).toBe(true);
    });

    it('should return false for non-string patterns', () => {
      expect(filterSearchInput('test', 123)).toBe(false);
      expect(filterSearchInput('test', {})).toBe(false);
    });

    it('should handle single character patterns', () => {
      expect(filterSearchInput('hello', 'h')).toBe(true);
      expect(filterSearchInput('hello', 'x')).toBe(false);
    });
  });
});
