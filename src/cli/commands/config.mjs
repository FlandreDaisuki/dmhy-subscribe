import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

const getDownloaders = () => {
  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  const downloadersDir = path.join(thisFileDir, '..', '..', 'downloaders');
  const downloaders = fs.readdirSync(downloadersDir).map((fullName) => path.parse(fullName).name);
  return downloaders;
};

/**
 * @param {string} key
 * @param {string} value
 */
const validateConfig = (key, value) => {
  if (key === 'downloader') {
    if (!getDownloaders().includes(value)) {
      return 'DLR_KEY_NOT_FOUND';
    }
  }
  return '';
};

/**
 * @param {import('~types').DatabaseConfig[]} configs
 * @param {string} key
 * @param {string} value
 * @param {import('sqlite3').Database} db
 */
const setConfig = async(configs, key, value, db) => {
  const found = configs.find((c) => c.key === key);
  if (!found) {
    return logger.error('dmhy:cli:config:setConfig')(t('CMD_CONFIG_KEY_NOT_FOUND', { key }));
  }

  const validatationError = validateConfig(key, value);
  if (validatationError) {
    return logger.error('dmhy:cli:config:setConfig')(t(validatationError, { key }));
  }

  const r = await setConfiguration(key, value, db);
  if (r.changes > 0) {
    logger.log(t('CMD_CONFIG_SUCCESS'));
  } else {
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
  } else {
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
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:config:argv')(argv);

  try {
    const db = await getDb();
    const configs = await getAllConfigurations(db);

    if (!argv.configKey && !argv.configValue) {
      return printConfig(configs, argv.format);
    }
    if (argv.configKey && !argv.configValue) {
      return getConfig(configs, argv.configKey);
    }
    if (argv.configKey && argv.configValue) {
      return setConfig(configs, argv.configKey, argv.configValue, db);
    }
  } catch (err) {
    debug('dmhy:cli:config')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:config')(err.message);
  }
};
