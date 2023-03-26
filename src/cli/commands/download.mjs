import { fileURLToPath } from 'url';
import path from 'path';
import debug from 'debug';

import {
  getAllConfigurations,
  getMigratedDb,
  getThreadsBySid,
  isExistingSubscriptionSid,
} from '../../database.mjs';
import * as logger from '../../logger.mjs';
import { isFileExists } from '../../utils.mjs';

export const command = 'download <sid> [episode-queries..]';

export const describe = 'download your subscriptions by following description';

export const aliases = ['dl'];

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs;
};

/**
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:download:argv')(argv);

  try {
    const db = await getDb();
    const configs = await getAllConfigurations(db);
    const downloaderConfig = configs.reduce((prev, curr) => ({ ...prev, [curr.name]: curr.value }), {});

    const downloaderName = downloaderConfig?.downloader ?? 'system';
    const thisFilePath = fileURLToPath(import.meta.url);
    const thisFileDir = path.dirname(thisFilePath);
    const downloaderPath = path.resolve( thisFileDir, `../../downloaders/${downloaderName}.mjs`);

    if (!(await isFileExists(downloaderPath))) {
      return logger.error('dmhy:cli:download')('Unknown downloader:', downloaderName);
    }
    const downloader = await import(downloaderPath);

    const targetSid = String(argv.sid).toUpperCase();
    if (!(await isExistingSubscriptionSid(targetSid, db))) {
      return logger.error('dmhy:cli:download')('Can not find sid:', targetSid);
    }
    const threads = await getThreadsBySid(targetSid, db);

    if (argv.episodeQueries.length === 0) {
      for (const thread of threads) {
        downloader.download(thread, downloaderConfig);
      }
    }

  } catch (err) {
    debug('dmhy:cli:download')(err);
    logger.error('dmhy:cli:download')(err.message);
  }
};
