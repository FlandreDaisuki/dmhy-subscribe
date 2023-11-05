import { z } from 'zod';
import debug from 'debug';

import {
  getAllConfigurations,
  getMigratedDb,
  getThreadsBySid,
  isExistingSubscriptionSid,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { compileEpisodeQuery, downloadThread, parseEpisode } from '../../utils.mjs';

export const command = 'download <sid> [episode-queries..]';

export const describe = t('CMD_DL_DESC');

export const aliases = ['dl'];

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_DL_USAGE'))
    .example(t('CMD_DL_EXAMPLE1'), t('CMD_DL_EXAMPLE1_DESC'))
    .example(t('CMD_DL_EXAMPLE2'), t('CMD_DL_EXAMPLE2_DESC'))
    .example(t('CMD_DL_EXAMPLE3'), t('CMD_DL_EXAMPLE3_DESC'));
};

const yargsZodParser = z.object({
  sid: z.string(),
  episodeQueries: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
});

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async (argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:download:argv')(argv);

  try {
    const db = await getDb();
    const allConfigs = await getAllConfigurations(db);
    const yz = yargsZodParser.parse(argv);

    /** @type {Partial<import('~types').DatabaseConfigDict>} */
    const config = allConfigs.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {});

    const targetSid = String(yz.sid).toUpperCase();
    if (!(await isExistingSubscriptionSid(targetSid, db))) {
      return logger.error('dmhy:cli:download:sid')(t('CMD_DL_SID_NOT_FOUND', { sid: targetSid }));
    }
    const extendThreads = (await getThreadsBySid(targetSid, db))
      .map((t, i) => ({
        ...t,
        order: i + 1,
        episode: parseEpisode(t.title, t.episodePatternString),
      }));

    const episodeQuery = compileEpisodeQuery(...(yz.episodeQueries ?? []));
    await Promise.all(extendThreads
      .filter((extendThread) => episodeQuery.match(extendThread))
      .map(async (extendThread) => {
        try {
          await downloadThread(extendThread, config);
        }
        catch (err) {
          logger.error('dmhy:cli:download:downloader')(err);
        }
      }));
  }
  catch (err) {
    debug('dmhy:cli:download')(err);
    // @ts-expect-error err is unknown type
    logger.error('dmhy:cli:download')(err.message);
  }
};
