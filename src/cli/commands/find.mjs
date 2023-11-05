import process from 'node:process';

import { z } from 'zod';
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

const yargsZodParser = z.object({
  title: z.string(),
  keywords: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
  excludeTitle: z.boolean().optional(),
  episodePattern: z.string().optional(),
  excludePattern: z.string().optional(),
  excludes: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
  thenAdd: z.boolean().optional(),
});

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async (argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:find:argv')(argv);

  try {
    const db = await getDb();
    const yz = yargsZodParser.parse(argv);

    const keywords = (yz.keywords ?? []).concat(yz.excludeTitle ? [] : [yz.title]).map(String);
    const rss = await getRssListByKeywords(keywords);

    const getExcludePattern = () => {
      if (yz.excludePattern) {
        return parsePattern(yz.excludePattern);
      }
      if (yz.excludes) {
        return joinToRegExp(yz.excludes);
      }
      return /$^/;
    };
    const episodePattern = yz.episodePattern ? parsePattern(yz.episodePattern) : /$^/;

    const filteredRssItems = rss.items.filter((item) => {
      return !(getExcludePattern().test(String(item.title)));
    });

    for (const item of filteredRssItems) {
      logger.log(item.title);
    }

    if (yz.thenAdd) {
      if (await isExistingSubscriptionTitle(yz.title, db)) {
        const answer = await ask(t('CMD_ADD_PROMPTS_CONFIRM', { title: yz.title }));
        if (!/(?:y|yes)/i.test(answer)) {
          return process.exit(1);
        }
      }

      await createSubscription(yz.title, {
        keywords,
        excludePatternString: String(getExcludePattern()),
        episodePatternString: String(episodePattern),
      }, db);
    }
  }
  catch (err) {
    debug('dmhy:cli:find')(err);
    // @ts-expect-error err is unknown type
    logger.error('dmhy:cli:find')(err.message);
  }
};
