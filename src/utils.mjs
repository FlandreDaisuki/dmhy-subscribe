import * as readline from 'readline';
import fs from 'fs/promises';
import { createHash } from 'crypto';

/** @param {string} path */
export const isFileExists = (path) =>
  fs.access(path)
    .then(() => true)
    .catch(() => false);

export const ask = async(question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, resolve);
  })
    .finally(() => rl.close());
};

export const parsePattern = (str) => {
  const patternStart = str.indexOf('/');
  const patternEnd = str.lastIndexOf('/');
  if (patternStart !== 0 || patternStart === patternEnd) {
    throw new Error('Input string must be in the format "/pattern/flags"');
  }
  const pattern = str.slice(patternStart + 1, patternEnd);
  const flags = str.slice(patternEnd + 1);
  return new RegExp(pattern, flags);
};

export const joinToRegExp = (stringList) => {
  // Escape special characters in each string and join them with a pipe
  const escapedStrings = stringList.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  // Create a regular expression that matches any of the strings in the array
  const regex = new RegExp(`(${escapedStrings})`);
  return regex;
};

export const sidHash = (...args) => {
  const h = createHash('sha1');
  for (const arg of args.flat(Infinity)) {
    h.update(arg);
  }
  return `ZZZ${h.digest('base64')
    .replaceAll(/[^a-z]/ig, '')
    .toUpperCase()
  }`.slice(-3);
};
