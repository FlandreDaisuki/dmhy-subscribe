import debug from 'debug';
import RSSParser from 'rss-parser';

import * as logger from '../../logger.mjs';
import { joinToRegExp, parsePattern } from '../../utils.mjs';

export const command = 'find <title> [keywords..]';

export const describe = 'find specific keywords to describe a subscription';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .option({
      'exclude-title': {
        type: 'boolean',
      },
      'episode-pattern': {
        type: 'string',
      },
      'exclude-pattern': {
        type: 'string',
      },
      'excludes': {
        alias: 'x',
        type: 'array',
      },
    });
};

export const handler = async(argv) => {
  debug('dmhy:cli:find')('argv:', argv);

  const u = new URL('https://share.dmhy.org/topics/rss/rss.xml');
  u.searchParams.append('sort_id', '2');

  const keywords = [].concat(argv.keywords).concat(argv.excludeTitle ? [] : [argv.title]);
  u.searchParams.append('keyword', keywords.join(' '));

  debug('dmhy:cli:find')('url:', u.href);

  try {
    const rss = await (new RSSParser).parseURL(u.href)
      .catch((err) => {
        logger.error('RSSParser')(err.message);
      });

    if (!rss) { return process.exit(1); }

    const getExcludePattern = () => {
      if (argv.excludePattern) {
        return parsePattern(argv.excludePattern);
      }
      if (argv.excludes) {
        return joinToRegExp(argv.excludes);
      }
      return /$^/;
    };

    const filteredRssItems = rss.items.filter((item) => {
      return !(getExcludePattern().test(item.title));
    });

    for (const item of filteredRssItems) {
      logger.log(item.title);
    }
  } catch (err) {
    debug('dmhy:cli:find')(err);
    logger.error('dmhy:cli:find')(err.message);
  }
};
