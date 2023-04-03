import debug from 'debug';

import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { getRssListByKeywords, joinToRegExp, parsePattern } from '../../utils.mjs';

export const command = 'find <title> [keywords..]';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_FIND_USAGE'))
    .option('exclude-title', {
      type: 'boolean',
    })
    .option('episode-pattern', {
      type: 'string',
    })
    .option('exclude-pattern', {
      type: 'string',
    })
    .option('excludes', {
      alias: 'x',
      type: 'array',
    })
    .conflicts('excludes', 'exclude-pattern')
    .example(t('CMD_FIND_EXAMPLE1'), t('CMD_FIND_EXAMPLE1_DESC'))
    .example(t('CMD_FIND_EXAMPLE2'), t('CMD_FIND_EXAMPLE2_DESC'))
    .example(t('CMD_FIND_EXAMPLE3'), t('CMD_FIND_EXAMPLE3_DESC'));
};

/**
 * @param {*} argv
 */
export const handler = async(argv) => {
  debug('dmhy:cli:find:argv')(argv);

  try {
    /** @type {string[]} */
    // @ts-expect-error
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
      return !(getExcludePattern().test(String(item.title)));
    });

    for (const item of filteredRssItems) {
      logger.log(item.title);
    }
  } catch (err) {
    debug('dmhy:cli:find')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:find')(err.message);
  }
};
