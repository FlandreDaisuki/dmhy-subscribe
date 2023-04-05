import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import debug from 'debug';

import * as logger from './logger.mjs';
import { LOCALE } from './env.mjs';

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
  } catch (err) {
    debug('dmhy:locale')(err);
    // @ts-expect-error
    logger.error('locale')(err.message);
  }
}

/**
 * @param {string} key
 * @param {Record<string, any>} placeholder
 * @returns {string}
 */
export const t = (key, placeholder = {}) => {
  let translated = dict[key];
  for (const [pk, pv] of Object.entries(placeholder)) {
    const pattern = pk.replace(/[$]/g, '[$]');
    translated = translated.replace(new RegExp(`%${pattern}%`, 'g'), pv);
  }
  return translated;
};
