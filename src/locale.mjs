import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import yaml from 'js-yaml';
import debug from 'debug';
import { LOCALE } from './env.mjs';

const thisFilePath = fileURLToPath(import.meta.url);
const thisFileDir = path.dirname(thisFilePath);
const d = debug('dmhy:locale');

const candidates = [
  `${thisFileDir}/locales/en.yml`,
  `${thisFileDir}/locales/${LOCALE.lang}.yml`,
  `${thisFileDir}/locales/${LOCALE.lang}_${LOCALE.territory}.yml`,
];

const dict = {};
for (const candidate of candidates) {
  try {
    const fileStat = await fs.stat(candidate).catch(() => null);
    d(fileStat ? 'Found' : 'Not found', chalk.magenta(candidate));

    if (fileStat?.isFile()) {
      const localeStrings = yaml.load(await fs.readFile(candidate, 'utf-8'));
      Object.assign(dict, localeStrings);
    }
  } catch (err) {
    d(err);
    console.error(chalk.blueBright('locale:'), err.message);
  }
}

export const t = (key, placeholder = {}) => {
  let translated = dict[key];
  for (const [pk, pv] of Object.entries(placeholder)) {
    const pattern = pk.replace(/[$]/g, '[$]');
    translated = translated.replace(new RegExp(`%${pattern}%`, 'g'), pv);
  }
  return translated;
};
