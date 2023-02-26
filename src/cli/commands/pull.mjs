import debug from 'debug';
import {
  bindSubscriptionAndThread,
  createThread,
  getAllSubscriptions,
  isExistingThreadDmhyLink,
} from '../../database.mjs';
import * as logger from '../../logger.mjs';
import { getRssListByKeywords, parsePattern } from '../../utils.mjs';

export const command = 'pull [sid..]';

export const describe = 'pull the remote threads by your subscriptions';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .option({});
};

export const handler = async(argv) => {
  debug('dmhy:cli:pull:argv')(argv);

  try {
    const subscriptions = await getAllSubscriptions();
    const pullingSids = (argv.sid ?? []).map((s) => String(s).toLowerCase());
    await Promise.all(
      subscriptions
        .filter((sub) => {
          if (pullingSids.length === 0) { return true; }

          return pullingSids.includes(String(sub.sid).toLowerCase());
        })
        .map(async(sub) => {
          debug('dmhy:cli:pull:subscription')(sub);

          const rss = await getRssListByKeywords(sub.keywords);
          const getExcludePattern = () => parsePattern(String(sub.excludePattern));
          const filteredRssItems = rss.items.filter((item) => !(getExcludePattern().test(item.title)));

          return Promise.all(filteredRssItems.map(async(rssItem) => {
            const dmhyLink = rssItem.link;
            const magnet = rssItem.enclosure.url;
            const title = rssItem.title;
            const publishDate = rssItem.isoDate;
            if (await isExistingThreadDmhyLink(dmhyLink)) {
              return;
            }

            const threadResult = await createThread(dmhyLink, magnet, title, publishDate);
            debug('dmhy:cli:pull:threadResult')(threadResult);

            await bindSubscriptionAndThread(sub.id, threadResult.lastID);
            debug('dmhy:cli:pull:rssItem')(rssItem);

            logger.log(`pull 「${title}」`);
          }));
        }),
    );
  } catch (err) {
    debug('dmhy:cli:pull')(err);
    logger.error('dmhy:cli:pull')(err.message);
  }
};
