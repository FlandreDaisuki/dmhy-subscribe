import { fileURLToPath } from 'url';
import path from 'path';
import debug from 'debug';

import {
  getAllConfigurations,
  getMigratedDb,
  getThreadsBySid,
  isExistingSubscriptionSid,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { compileEpisodeQuery, isFileExists, parseEpisode } from '../../utils.mjs';


export const command = 'download <sid> [episode-queries..]';

export const aliases = ['dl'];

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_DL_USAGE'))
    .example(t('CMD_DL_EXAMPLE1'), t('CMD_DL_EXAMPLE1_DESC'))
    .example(t('CMD_DL_EXAMPLE2'), t('CMD_DL_EXAMPLE2_DESC'))
    .example(t('CMD_DL_EXAMPLE3'), t('CMD_DL_EXAMPLE3_DESC'));
};

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:download:argv')(argv);

  try {
    const db = await getDb();
    const allConfigs = await getAllConfigurations(db);

    /** @type {import('~types').DatabaseConfigDict} */
    // @ts-expect-error
    const config = allConfigs.reduce((prev, curr) => ({ ...prev, [curr.name]: curr.value }), {});

    const downloaderName = config?.downloader ?? 'system';
    const thisFilePath = fileURLToPath(import.meta.url);
    const thisFileDir = path.dirname(thisFilePath);
    const downloaderPath = path.resolve(thisFileDir, `../../downloaders/${downloaderName}.mjs`);

    if (!(await isFileExists(downloaderPath))) {
      return logger.error('dmhy:cli:download:downloader')(t('CMD_DL_DLR_NOT_FOUND', { name: downloaderName }));
    }
    const downloader = await import(downloaderPath);

    const targetSid = String(argv.sid).toUpperCase();
    if (!(await isExistingSubscriptionSid(targetSid, db))) {
      return logger.error('dmhy:cli:download:sid')(t('CMD_DL_SID_NOT_FOUND', { sid: targetSid }));
    }
    const extendThreads = (await getThreadsBySid(targetSid, db))
      .sort((a, b) => Date.parse(a.publishDate) - Date.parse(b.publishDate))
      .map((t, i) => ({
        ...t,
        order: i + 1,
        episode: parseEpisode(t.title, t.episodePatternString),
      }));

    const episodeQuery = compileEpisodeQuery(...argv.episodeQueries);
    for (const extendThread of extendThreads) {
      if (episodeQuery.match(extendThread)) {
        downloader.download(extendThread, config);
      }
    }

  } catch (err) {
    debug('dmhy:cli:download')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:download')(err.message);
  }
};
