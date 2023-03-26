import debug from 'debug';
import { Table } from 'console-table-printer';

import * as logger from '../../logger.mjs';
import { getLatestSubscriptionThreads, getMigratedDb } from '../../database.mjs';
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
    const subscriptionThreads = await getLatestSubscriptionThreads(db);
    for (const st of subscriptionThreads) {
      debug('dmhy:cli:list:subscriptionThread')(JSON.stringify(st));
    }

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
          episode: toEpisodeDisplay(parseEpisode(st.threadTitle)),
          subscriptionTitle: st.subscriptionTitle,
        })),
      }).printTable();
    }

  } catch (err) {
    debug('dmhy:cli:list')(err);
    logger.error('dmhy:cli:list')(err.message);
  }
};
