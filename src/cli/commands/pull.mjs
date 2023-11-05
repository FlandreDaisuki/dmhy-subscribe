import debug from 'debug';
import { z } from 'zod';

import {
  bindSubscriptionAndThread,
  createThread,
  getAllConfigurations,
  getAllSubscriptions,
  getMigratedDb,
  getThreadByDmhyLink,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { downloadThread, getRssListByKeywords, parsePattern } from '../../utils.mjs';

export const command = 'pull [sid..]';

export const describe = t('CMD_PULL_DESC');

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_PULL_USAGE'))
    .option('then-download', {
      alias: 'd',
      type: 'boolean',
    });
};

const yargsZodParser = z.object({
  sid: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
  thenDownload: z.boolean().optional(),
});

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async (argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:pull:argv')(argv);

  try {
    const db = await getDb();
    const subscriptions = await getAllSubscriptions(db);
    const yz = yargsZodParser.parse(argv);

    const pullingSids = (yz.sid ?? []).map((s) => String(s).toUpperCase());

    const allConfigs = await getAllConfigurations(db);

    /** @type {Partial<import('~types').DatabaseConfigDict>}} */
    const config = allConfigs.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {});

    await Promise.all(
      subscriptions
        .filter((sub) => {
          if (pullingSids.length === 0) { return true; }

          return pullingSids.includes(String(sub.sid).toUpperCase());
        })
        .map(async (sub) => {
          debug('dmhy:cli:pull:subscription')(sub);

          const rss = await getRssListByKeywords(sub.keywords);
          const getExcludePattern = () => parsePattern(String(sub.excludePattern));
          const filteredRssItems = rss.items.filter((item) => !(getExcludePattern().test(String(item.title))));

          return Promise.all(filteredRssItems.map(async (rssItem) => {
            const dmhyLink = rssItem.link;
            const magnet = rssItem.enclosure?.url;
            const title = rssItem.title;
            const publishDate = rssItem.isoDate;
            if (!dmhyLink || !magnet || !title || !publishDate) {
              return debug('dmhy:cli:pull:rssItem')(rssItem);
            }

            let threadId = await getThreadByDmhyLink(dmhyLink, db);
            if (threadId === null) {
              const threadResult = await createThread(dmhyLink, magnet, title, publishDate, db);
              debug('dmhy:cli:pull:threadResult')(threadResult);

              threadId = threadResult.lastID;
            }

            const bound = await bindSubscriptionAndThread(sub.id, threadId, db);
            debug('dmhy:cli:pull:rssItem')(rssItem);

            if (bound) {
              logger.log(t('CMD_PULL_SUCCESS', { title }));

              if (yz.thenDownload) {
                await downloadThread({ title, magnet }, config);
              }
            }
          }));
        }),
    );
  }
  catch (err) {
    debug('dmhy:cli:pull')(err);
    // @ts-expect-error err is unknown type
    logger.error('dmhy:cli:pull')(err.message);
  }
};
