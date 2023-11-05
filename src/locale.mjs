import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import debug from 'debug';
import yaml from 'js-yaml';
import { LOCALE } from './env.mjs';
import * as logger from './logger.mjs';

const thisFilePath = fileURLToPath(import.meta.url);
const thisFileDir = path.dirname(thisFilePath);

const candidates = [
  `${thisFileDir}/locales/en.yml`,
  `${thisFileDir}/locales/${LOCALE.lang}.yml`,
  `${thisFileDir}/locales/${LOCALE.lang}_${LOCALE.territory}.yml`,
];

/** @type {Record<string, string>} */
const dict = {};

for (const candidate of candidates) {
  try {
    const fileStat = await fs.stat(candidate).catch(() => null);
    if (fileStat?.isFile()) {
      const localeStrings = yaml.load(await fs.readFile(candidate, 'utf-8'));
      Object.assign(dict, localeStrings);
    }
  }
  catch (err) {
    debug('dmhy:locale')(err);
    // @ts-expect-error err is unknown type
    logger.error('locale')(err.message);
  }
}

/**
 * @param {string} key
 * @param {Record<string, any>} placeholder
 */
export const t = (key, placeholder = {}) => {
  let translated = dict[key];
  for (const [pk, pv] of Object.entries(placeholder)) {
    const pattern = pk.replace(/[$]/g, '[$]');
    translated = translated.replace(new RegExp(`%${pattern}%`, 'g'), pv);
  }
  return translated;
};
