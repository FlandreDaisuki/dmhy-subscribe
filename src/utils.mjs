import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as readline from 'node:readline';
import process from 'node:process';

import debug from 'debug';
import RSSParser from 'rss-parser';
import * as logger from './logger.mjs';
import { t } from './locale.mjs';

/**
 * @param {number} start
 * @param {number | undefined} end
 * @param {number} [step]
 */
const range = (start, end, step = 1) => {
  const min = Math.min(start, end ?? 0);
  const max = Math.max(start, end ?? 0);

  const length = Math.round((max - min) / step);
  return Array.from({ length }, (_, i) => i * step + min);
};

/**
 * @template T
 * @param {T[]} arr
 * @param {(item: T) => Promise<boolean>} predicate
 */
export const arrayAsyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_, idx) => results[idx]);
};

/** @param {string} absPath */
export const isFileExists = (absPath) =>
  fs.access(absPath)
    .then(() => true)
    .catch(() => false);

/** @param {string} question */
export const ask = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, resolve);
  })
    .finally(() => rl.close());
};

/** @param {string} str */
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

/** @param {string[]} stringList */
export const joinToRegExp = (stringList) => {
  // Escape special characters in each string and join them with a pipe
  const escapedStrings = stringList.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  // Create a regular expression that matches any of the strings in the array
  const regex = new RegExp(`(${escapedStrings})`);
  return regex;
};

/** @param {string[]} args */
export const sidHash = (...args) => {
  const h = createHash('sha1');
  for (const arg of args.flat(Number.POSITIVE_INFINITY)) {
    h.update(arg);
  }
  return `ZZZ${h.digest('base64')
    .replaceAll(/[^a-z]/ig, '')
    .toUpperCase()
  }`.slice(-3);
};

/** @param {string[]} keywords */
export const getRssListByKeywords = async (keywords = []) => {
  const u = new URL('https://share.dmhy.org/topics/rss/rss.xml');
  u.searchParams.append('sort_id', '2');

  u.searchParams.append('keyword', Array.from(keywords).join(' '));
  debug('dmhy:utils:getRssListByKeywords:url')(u.href);

  const rss = await (new RSSParser()).parseURL(u.href)
    .catch((err) => {
      logger.error('dmhy:RSSParser')(err.message);
    });

  if (!rss) { return process.exit(1); }

  return rss;
};

/**
 * @param {string} threadTitle
 * @returns {import('~types').Episode} parsed episode
 */
export const parseEpisode = (threadTitle, episodePatternString = '/$^/') => {
  /** @param {string} s */
  const parseRangeEpisode = (s) => {
    // [\d.]+[-~][\d.]+
    const str = s.replace(/(?:\D*|^)([\d.]+)([-~][\d.]+)?(?:\D*|$)/, '$1$2');
    const [from, to] = str.split(/[-~]/).map((t) => Number.parseFloat(t));
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
      /^(\d+\s*年)?\d+\s*月$/,
      /(\d+\s*年)?\d+\s*月新?番/,
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
    return { from: Number.NaN, to: Number.NaN };
  }
  catch {
    return { from: Number.NaN, to: Number.NaN };
  }
};

/** @param {import('~types').Episode} episode */
export const toEpisodeDisplay = (episode) => {
  if (!episode.from) {
    return '??';
  }

  if (!episode.to) {
    return episode.from;
  }

  return `${episode.from}-${episode.to}`;
};

/**
 * @param  {...(string|number)} episodeQueries
 */
export const compileEpisodeQuery = (...episodeQueries) => {
  const normalizedQueries = episodeQueries
    .flatMap((q) => String(q).split(','))
    .flatMap((q) => q.trim());

  /** @type {number[]} */
  const episodes = [];
  /** @type {number[]} */
  const orders = [];

  for (const q of normalizedQueries) {
    const ord = q.startsWith('@');
    const rng = /~/.test(q);

    const list = ord ? orders : episodes;
    const z = q.replace(/^@?/, '');

    if (!rng) {
      const n = Number(z);
      list.push(n);
    }
    else {
      const [l, r] = z.split('~').filter(Boolean).map(Number);
      for (const rn of range(l, r + 1)) {
        list.push(rn);
      }
    }
  }

  return {
    /**  @param {{episode: Partial<import('~types').Episode>; order: number;}} extendThread */
    match: (extendThread) => {
      const threadEpisodes = (
        !extendThread.episode.to
          ? [Number(extendThread.episode.from)]
          : range(Number(extendThread.episode.from), extendThread.episode.to + 1)
      ).filter(Number.isFinite);

      if (episodes.length > 0 && orders.length > 0) {
        return threadEpisodes.some((ep) => episodes.includes(ep)) || orders.includes(extendThread.order);
      }
      else if (episodes.length > 0 && orders.length === 0) {
        return threadEpisodes.some((ep) => episodes.includes(ep));
      }
      else if (episodes.length === 0 && orders.length > 0) {
        return orders.includes(extendThread.order);
      }
      else {
        return true;
      }
    },
  };
};

/**
 * @param {{title: string; magnet: import('~types').MagnetString;}} threadLike
 * @param {Partial<import('~types').DatabaseConfigDict>} config
 */
export const downloadThread = async (threadLike, config) => {
  const downloaderName = config?.downloader ?? 'system';
  const thisFilePath = fileURLToPath(import.meta.url);
  const thisFileDir = path.dirname(thisFilePath);
  const downloaderPath = path.resolve(thisFileDir, `./downloaders/${downloaderName}.mjs`);

  if (!(await isFileExists(downloaderPath))) {
    throw new Error(t('CMD_DL_DLR_NOT_FOUND', { name: downloaderName }));
  }

  const downloader = await import(downloaderPath);
  return downloader.download(threadLike, config);
};
