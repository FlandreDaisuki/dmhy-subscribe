import debug from 'debug';
import { Table } from 'console-table-printer';

import * as logger from '../../logger.mjs';
import { getAllSubscriptions,
  getLatestThreadsInEachSubscription,
  getMigratedDb,
  getThreadsBySid,
  isExistingSubscriptionSid,
} from '../../database.mjs';
import { parseEpisode, toEpisodeDisplay } from '../../utils.mjs';

export const command = 'list [sid]';

export const describe = 'list described or all subscriptions';

export const aliases = ['ls'];

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

/**
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
        return logger.error('dmhy:cli:list')('Can not find sid:', targetSid);
      }

      // TODO: getSubscriptionBySid
      const targetSubscription = (await getAllSubscriptions(db)).find((sub) => sub.sid === targetSid);
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
        logger.log('sid:', targetSubscription.sid);
        logger.log('title:', targetSubscription.title);
        logger.log('keywords:', targetSubscription.keywords.join(', '));
        logger.log('episodePattern:', targetSubscription.episodePattern);
        logger.log('excludePattern:', targetSubscription.excludePattern);
        new Table({
          columns: [
            { name: 'order', alignment: 'center' },
            { name: 'episode', alignment: 'center' },
            { name: 'title', alignment: 'center' },
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
      logger.log(subscriptionThreads);
    } else {
      new Table({
        columns: [
          { name: 'sid', alignment: 'center' },
          { name: 'episode', title: '最新集數', alignment: 'center' },
          { name: 'subscriptionTitle', title: '訂閱標題', alignment: 'left' },
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
    logger.error('dmhy:cli:list')(err.message);
  }
};
