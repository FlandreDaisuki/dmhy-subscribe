import debug from 'debug';

import * as logger from '../../logger.mjs';
import { getRssListByKeywords, joinToRegExp, parsePattern } from '../../utils.mjs';

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

  try {
    const keywords = [].concat(argv.keywords).concat(argv.excludeTitle ? [] : [argv.title]);
    const rss = await getRssListByKeywords(keywords);

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
