import debug from 'debug';

import {
  bindSubscriptionAndThread,
  createThread,
  getAllSubscriptions,
  getMigratedDb,
  isExistingThreadDmhyLink,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { getRssListByKeywords, parsePattern } from '../../utils.mjs';

export const command = 'pull [sid..]';

export const describe = 'pull the remote threads by your subscriptions';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .option({});
};

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:pull:argv')(argv);

  try {
    const db = await getDb();
    const subscriptions = await getAllSubscriptions(db);
    /** @type {string[]} */
    // @ts-expect-error
    const pullingSids = (argv.sid ?? []).map((s) => String(s).toUpperCase());
    await Promise.all(
      subscriptions
        .filter((sub) => {
          if (pullingSids.length === 0) { return true; }

          return pullingSids.includes(String(sub.sid).toUpperCase());
        })
        .map(async(sub) => {
          debug('dmhy:cli:pull:subscription')(sub);

          const rss = await getRssListByKeywords(sub.keywords);
          const getExcludePattern = () => parsePattern(String(sub.excludePattern));
          const filteredRssItems = rss.items.filter((item) => !(getExcludePattern().test(String(item.title))));

          return Promise.all(filteredRssItems.map(async(rssItem) => {
            const dmhyLink = rssItem.link;
            const magnet = rssItem.enclosure?.url;
            const title = rssItem.title;
            const publishDate = rssItem.isoDate;
            if (!dmhyLink || !magnet || !title || !publishDate){
              return debug('dmhy:cli:pull:rssItem')(rssItem);
            }
            if (await isExistingThreadDmhyLink(dmhyLink, db)) {
              return;
            }

            const threadResult = await createThread(dmhyLink, magnet, title, publishDate, db);
            debug('dmhy:cli:pull:threadResult')(threadResult);

            await bindSubscriptionAndThread(sub.id, threadResult.lastID, db);
            debug('dmhy:cli:pull:rssItem')(rssItem);

            logger.log(t('CMD_PULL_SUCCESS', { title }));
          }));
        }),
    );
  } catch (err) {
    debug('dmhy:cli:pull')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:pull')(err.message);
  }
};
