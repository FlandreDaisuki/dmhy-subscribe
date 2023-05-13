import debug from 'debug';

import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { ask, getRssListByKeywords, joinToRegExp, parsePattern } from '../../utils.mjs';
import { createSubscription, getMigratedDb, isExistingSubscriptionTitle } from '../../database.mjs';

export const command = 'find <title> [keywords..]';

export const describe = t('CMD_FIND_DESC');

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
    .option('then-add', {
      alias: 'a',
      type: 'boolean',
    })
    .conflicts('excludes', 'exclude-pattern')
    .example(t('CMD_FIND_EXAMPLE1'), t('CMD_FIND_EXAMPLE1_DESC'))
    .example(t('CMD_FIND_EXAMPLE2'), t('CMD_FIND_EXAMPLE2_DESC'))
    .example(t('CMD_FIND_EXAMPLE3'), t('CMD_FIND_EXAMPLE3_DESC'));
};

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:find:argv')(argv);

  try {
    const db = await getDb();

    /** @type {string[]} */
    // @ts-expect-error
    const keywords = [].concat(argv.keywords).concat(argv.excludeTitle ? [] : [argv.title]).map(String);
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
    const episodePattern = argv.episodePattern ? parsePattern(argv.episodePattern) : /$^/;

    const filteredRssItems = rss.items.filter((item) => {
      return !(getExcludePattern().test(String(item.title)));
    });

    for (const item of filteredRssItems) {
      logger.log(item.title);
    }

    if (argv.thenAdd) {
      if (await isExistingSubscriptionTitle(argv.title, db)) {
        const answer = await ask(t('CMD_ADD_PROMPTS_CONFIRM', { title: argv.title }));
        if (!/(?:y|yes)/i.test(answer)) {
          return process.exit(1);
        }
      }

      await createSubscription(argv.title, {
        keywords,
        excludePatternString: String(getExcludePattern()),
        episodePatternString: String(episodePattern),
      }, db);
    }
  } catch (err) {
    debug('dmhy:cli:find')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:find')(err.message);
  }
};
