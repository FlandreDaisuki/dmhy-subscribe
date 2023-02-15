import { expect, test } from 'vitest';
import { joinToRegExp, parsePattern } from './utils.mjs';

test('parsePattern', () => {
  expect(parsePattern('//').test('abc123')).toBe(true);
  expect(parsePattern('/\\d/').test('abc')).toBe(false);
  expect(parsePattern('/\\d/').test('abc123')).toBe(true);
  expect(parsePattern('/(\\d)/').test('abc123')).toBe(true);
  expect(parsePattern('/(\\w+)\\d+/').test('abc123')).toBe(true);
  expect(parsePattern('/ABC123/').test('abc123')).toBe(false);
  expect(parsePattern('/ABC123/i').test('abc123')).toBe(true);
  expect(parsePattern('/^hello\\s*,?\\s*world$/ig').test('Hello,world')).toBe(true);
  expect(parsePattern('/^(?:the|hello)\\s*,?\\s*world$/ig').test('the world')).toBe(true);

  expect(() => parsePattern('^(?:the|hello)\\s*,?\\s*world$').test('the world'))
    .throw('Input string must be in the format "/pattern/flags"');
});

test('joinToRegExp', () => {
  const words = ['hello', 'w?o?r?l?d?', '$5.99', '^99% discount$', 'tic|toc'];
  expect(joinToRegExp(words).test('hello')).toBe(true);
  expect(joinToRegExp(words).test('')).toBe(false);
  expect(joinToRegExp(words).test('world')).toBe(false);
  expect(joinToRegExp(words).test('w?o?r?l?d?')).toBe(true);
  expect(joinToRegExp(words).test('5.99')).toBe(false);
  expect(joinToRegExp(words).test('$5.99')).toBe(true);
  expect(joinToRegExp(words).test('99% discount')).toBe(false);
  expect(joinToRegExp(words).test('^99% discount$')).toBe(true);
  expect(joinToRegExp(words).test('tic')).toBe(false);
  expect(joinToRegExp(words).test('tic|toc')).toBe(true);
});
