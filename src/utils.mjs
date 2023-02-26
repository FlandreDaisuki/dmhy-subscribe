import fs from 'fs/promises';
import { createHash } from 'crypto';
import * as readline from 'readline';
import debug from 'debug';
import RSSParser from 'rss-parser';
import * as logger from './logger.mjs';


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

export const getRssListByKeywords = async(keywords = []) => {
  const u = new URL('https://share.dmhy.org/topics/rss/rss.xml');
  u.searchParams.append('sort_id', '2');

  u.searchParams.append('keyword', Array.from(keywords).join(' '));
  debug('dmhy:utils:getRssListByKeywords:url')( u.href);

  const rss = await (new RSSParser).parseURL(u.href)
    .catch((err) => {
      logger.error('RSSParser')(err.message);
    });

  if (!rss) { return process.exit(1); }
  return rss;
};

/** @param {string} threadTitle */
export const parseEpisode = (threadTitle, episodePatternString = '/$^/') => {
  const parseRangeEpisode = (s) => {
    // [\d.]+[-~][\d.]+
    const str = s.replace(/(?:\D*|^)([\d.]+)([-~][\d.]+)?(?:\D*|$)/, '$1$2');
    const [from, to] = str.split(/[-~]/).map((t) => parseFloat(t));
    return { from: Number(from), to: Number(to) };
  };

  try {
    // matched group 1
    const mg1 = threadTitle.match(parsePattern(episodePatternString))?.[1];
    if (mg1 && /\d/.test(mg1)) {
      return parseRangeEpisode(mg1);
    }

    // rule-based episode parse
    const BLACKLIST_PATTERNS = [
      /x?(1080|720|480)p?/,
      /^\d+\s*月$/,
      /\d+\s*月新番/,
      /x26[45]/,
      /(10|8)bit/,
      /ma10p/,
      /\bv\d/,
      /big5/,
      /mp4/,
    ];

    const tokens = threadTitle
      .split(/[[\]【】_\s]/g)
      .filter(Boolean)
      .map((x) => x.toLowerCase())
      .filter((x) => /\d/.test(x))
      .filter((x) => !BLACKLIST_PATTERNS.some((rule) => rule.test(x)))
      .map((x) => x.trim());

    // Find episode from last is easier
    for (const token of tokens.reverse()) {
      const tok = token
        .replace(/\s*(end|完)$/, '') // [24 end], [06完]
        .replace(/\s*v\d+$/, '') // [20v2]
        .replace(/[+].*$/, ''); // 03+SP03

      const tokParsed = parseRangeEpisode(tok);
      if (tokParsed.from) {
        return tokParsed;
      }
    }
    return {};
  } catch (error) {
    return {};
  }
};

export const toEpisodeDisplay = (episode) => {
  if (!episode.from) {
    return '??';
  }

  if (!episode.to) {
    return episode.from;
  }

  return `${episode.from}-${episode.to}`;
};
