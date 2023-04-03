import debug from 'debug';
import { Table } from 'console-table-printer';

import {
  getAllConfigurations,
  getMigratedDb,
  setConfiguration,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';

export const command = 'config [config-name] [config-value]';

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

/**
 * @param {import('~types').DatabaseConfig[]} configs
 * @param {string} name
 * @param {string} value
 * @param {import('sqlite3').Database} db
 */
const setConfig = async(configs, name, value, db) => {
  const found = configs.find((c) => c.name === name);
  if (!found) {
    return logger.error('dmhy:cli:config:setConfig')(t('CMD_CONFIG_KEY_NOT_FOUND', { name }));
  }

  const r = await setConfiguration(name, value, db);
  if (r.changes > 0) {
    logger.log(t('CMD_CONFIG_SUCCESS'));
  } else {
    debug('dmhy:cli:config:setConfig')(r);
  }
};

/**
 * @param {import('~types').DatabaseConfig[]} configs
 * @param {string} name
 */
const getConfig = (configs, name) => {
  const found = configs.find((c) => c.name === name);
  if (!found) {
    return logger.error('dmhy:cli:config:getConfig')(t('CMD_CONFIG_KEY_NOT_FOUND', { name }));
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
        (prev, curr) => ({ ...prev, [curr.name]: curr.value }),
        {},
      ),
    );
  } else {
    new Table({
      columns: [
        { name: 'name', alignment: 'center' },
        { name: 'value', alignment: 'center' },
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

    if (!argv.configName && !argv.configValue) {
      return printConfig(configs, argv.format);
    }
    if (argv.configName && !argv.configValue) {
      return getConfig(configs, argv.configName);
    }
    if (argv.configName && argv.configValue) {
      return setConfig(configs, argv.configName, argv.configValue, db);
    }
  } catch (err) {
    debug('dmhy:cli:config')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:config')(err.message);
  }
};
