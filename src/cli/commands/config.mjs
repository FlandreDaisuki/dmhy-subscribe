import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';
import debug from 'debug';
import { Table } from 'console-table-printer';

import {
  getAllConfigurations,
  getMigratedDb,
  setConfiguration,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';

export const command = 'config [config-key] [config-value]';

export const describe = t('CMD_CONFIG_DESC');

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_CONFIG_USAGE'))
    .option('format', {
      alias: 'f',
      choices: ['table', 'json'],
      default: 'table',
      type: 'string',
    })
    .example(t('CMD_CONFIG_EXAMPLE1'), t('CMD_CONFIG_EXAMPLE1_DESC'))
    .example(t('CMD_CONFIG_EXAMPLE2'), t('CMD_CONFIG_EXAMPLE2_DESC'))
    .example(t('CMD_CONFIG_EXAMPLE3'), t('CMD_CONFIG_EXAMPLE3_DESC'));
};

const yargsZodParser = z.object({
  configKey: z.string().optional(),
  configValue: z.string().optional(),
  format: z.enum(['table', 'json']),
});

const getDownloaders = async () => {
  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  const downloadersDir = path.join(thisFileDir, '..', '..', 'downloaders');
  const downloadersFilename = await fs.readdir(downloadersDir);
  const downloaders = downloadersFilename.map((fullName) => path.parse(fullName).name);
  return downloaders;
};

/**
 * @param {string} key
 * @param {string} value
 */
const validateConfig = async (key, value) => {
  if (key === 'downloader') {
    const supportedDownloaders = await getDownloaders();
    if (!supportedDownloaders.includes(value)) {
      logger.error('dmhy:cli:config:setConfig')(t('DLR_KEY_NOT_FOUND', { key }));
      return true;
    }
  }
  return false;
};

/**
 * @param {import('~types').DatabaseConfig[]} configs
 * @param {string} key
 * @param {string} value
 * @param {import('sqlite3').Database} db
 */
const setConfig = async (configs, key, value, db) => {
  const found = configs.find((c) => c.key === key);
  if (!found) {
    return logger.error('dmhy:cli:config:setConfig')(t('CMD_CONFIG_KEY_NOT_FOUND', { key }));
  }

  const hasError = await validateConfig(key, value);
  if (hasError) {
    return;
  }

  const r = await setConfiguration(key, value, db);
  if (r.changes > 0) {
    logger.log(t('CMD_CONFIG_SUCCESS'));
  }
  else {
    debug('dmhy:cli:config:setConfig')(r);
  }
};

/**
 * @param {import('~types').DatabaseConfig[]} configs
 * @param {string} key
 */
const getConfig = (configs, key) => {
  const found = configs.find((c) => c.key === key);
  if (!found) {
    return logger.error('dmhy:cli:config:getConfig')(t('CMD_CONFIG_KEY_NOT_FOUND', { key }));
  }
  logger.log(found.value);
};

/**
 * @param {import('~types').DatabaseConfig[]} configs
 * @param {'json' | 'table'} format
 */
const printConfig = (configs, format) => {
  if (format === 'json') {
    logger.log(
      configs.reduce(
        (prev, curr) => ({ ...prev, [curr.key]: curr.value }),
        {},
      ),
    );
  }
  else {
    new Table({
      columns: [
        { name: 'key', alignment: 'center', title: t('CMD_CONFIG_TH_KEY') },
        { name: 'value', alignment: 'center', title: t('CMD_CONFIG_TH_VALUE') },
      ],
      rows: configs,
    }).printTable();
  }
};

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async (argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:config:argv')(argv);

  try {
    const db = await getDb();
    const configs = await getAllConfigurations(db);
    const yz = yargsZodParser.parse(argv);

    if (!yz.configKey && !yz.configValue) {
      return printConfig(configs, yz.format);
    }
    if (yz.configKey && !yz.configValue) {
      return getConfig(configs, yz.configKey);
    }
    if (yz.configKey && yz.configValue) {
      return setConfig(configs, yz.configKey, yz.configValue, db);
    }
  }
  catch (err) {
    debug('dmhy:cli:config')(err);
    // @ts-expect-error err is unknown type
    logger.error('dmhy:cli:config')(err.message);
  }
};
