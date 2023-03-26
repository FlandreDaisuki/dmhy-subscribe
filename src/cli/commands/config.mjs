import debug from 'debug';
import { Table } from 'console-table-printer';

import {
  getAllConfigurations,
  getMigratedDb,
  setConfiguration,
} from '../../database.mjs';
import * as logger from '../../logger.mjs';

export const command = 'config [config-name] [config-value]';

export const describe = 'config dmhy-subscribe';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .option('format', {
      alias: 'f',
      choices: ['table', 'json'],
      default: 'table',
      type: 'string',
    });
};

/** @typedef {{name: string; value: string;}} Config */

/**
 * @param {Config[]} configs
 * @param {string} name
 * @param {string} value
 * @param {import('sqlite3').Database} db
 */
const setConfig = async(configs, name, value, db) => {
  const found = configs.find((c) => c.name === name);
  if (!found) {
    return logger.error('dmhy:cli:config:setConfig')('Unknown config name:', name);
  }

  const r = await setConfiguration(name, value, db);
  if (r.changes > 0) {
    logger.log('successful!');
  } else {
    debug('dmhy:cli:config:setConfig')(r);
  }
};

/**
 * @param {Config[]} configs
 * @param {string} name
 */
const getConfig = (configs, name) => {
  const found = configs.find((c) => c.name === name);
  if (!found) {
    return logger.error('Unknown config name:', name);
  }
  logger.log(found.value);
};

/**
 * @param {Config[]} configs
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
    logger.error('dmhy:cli:config')(err.message);
  }
};
