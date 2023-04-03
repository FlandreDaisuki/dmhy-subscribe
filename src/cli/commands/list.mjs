import assert from 'assert';
import debug from 'debug';
import { Table } from 'console-table-printer';

import {
  getAllSubscriptions,
  getLatestThreadsInEachSubscription,
  getMigratedDb,
  getThreadsBySid,
  isExistingSubscriptionSid,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { parseEpisode, toEpisodeDisplay } from '../../utils.mjs';

export const command = 'list [sid]';

export const aliases = ['ls'];

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_LS_USAGE'))
    .option('format', {
      alias: 'f',
      choices: ['table', 'json'],
      default: 'table',
      type: 'string',
    });
};

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:list:argv')(argv);

  try {
    const db = await getDb();
    const subscriptionThreads = await getLatestThreadsInEachSubscription(db);
    for (const st of subscriptionThreads) {
      debug('dmhy:cli:list:subscriptionThread')(JSON.stringify(st));
    }

    // #region list sid
    if (argv.sid) {
      const targetSid = String(argv.sid).toUpperCase();
      if (!(await isExistingSubscriptionSid(targetSid, db))) {
        return logger.error('dmhy:cli:list')(t('CMD_LS_SID_NOT_FOUND', { sid: targetSid }));
      }

      // TODO: getSubscriptionBySid & remove assert
      const targetSubscription = (await getAllSubscriptions(db)).find((sub) => sub.sid === targetSid);
      assert(targetSubscription); // Make typescript happy
      const threads = await getThreadsBySid(targetSid, db);
      if (argv.format === 'json') {
        return logger.log(JSON.stringify({
          sid: targetSubscription.sid,
          title: targetSubscription.title,
          keywords: targetSubscription.keywords,
          episodePattern: String(targetSubscription.episodePattern),
          excludePattern: String(targetSubscription.excludePattern),
          threads: threads.map((th, i) => ({
            order: i + 1,
            title: th.title,
            episode: toEpisodeDisplay(parseEpisode(th.title, th.episodePatternString)),
          })),
        }, null, 2));
      } else {
        // TODO: i18n & print style
        logger.log('sid:', targetSubscription.sid);
        logger.log('title:', targetSubscription.title);
        logger.log('keywords:', targetSubscription.keywords.join(', '));
        logger.log('episodePattern:', targetSubscription.episodePattern);
        logger.log('excludePattern:', targetSubscription.excludePattern);

        new Table({
          columns: [
            { name: 'order', title: t('CMD_LS_TH_ORDER'), alignment: 'center' },
            { name: 'episode', title: t('CMD_LS_TH_EPISODE'), alignment: 'center' },
            { name: 'title', title: t('CMD_LS_TH_TITLE'), alignment: 'center' },
          ],
          rows: threads.map((th, i) => ({
            order: `#${i + 1}`,
            episode: toEpisodeDisplay(parseEpisode(th.title, th.episodePatternString)),
            title: th.title,
          })),
        }).printTable();
      }
      return;
    }
    // #endregion list sid

    // #region list all
    if (argv.format === 'json') {
      logger.log(JSON.stringify(subscriptionThreads, null, 2));
    } else {
      new Table({
        columns: [
          { name: 'sid', alignment: 'center' },
          { name: 'episode', title: t('CMD_LS_TH_EPISODE_ALL'), alignment: 'center' },
          { name: 'subscriptionTitle', title: t('CMD_LS_TH_TITLE_ALL'), alignment: 'left' },
        ],
        rows: subscriptionThreads.map((st) => ({
          sid: st.sid,
          episode: toEpisodeDisplay(parseEpisode(st.threadTitle, st.episodePatternString)),
          subscriptionTitle: st.subscriptionTitle,
        })),
      }).printTable();
    }
    // #endregion list all

  } catch (err) {
    debug('dmhy:cli:list')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:list')(err.message);
  }
};
