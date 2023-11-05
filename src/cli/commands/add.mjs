import process from 'node:process';

import debug from 'debug';
import { z } from 'zod';

import {
  createSubscription,
  getMigratedDb,
  isExistingSubscriptionTitle,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { ask, joinToRegExp, parsePattern } from '../../utils.mjs';

export const command = 'add <title> [keywords..]';

export const describe = t('CMD_ADD_DESC');

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_ADD_USAGE'))
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
    .example(t('CMD_ADD_EXAMPLE1'), t('CMD_ADD_EXAMPLE1_DESC'))
    .example(t('CMD_ADD_EXAMPLE2'), t('CMD_ADD_EXAMPLE2_DESC'))
    .example(t('CMD_ADD_EXAMPLE3'), t('CMD_ADD_EXAMPLE3_DESC'));
};

const yargsZodParser = z.object({
  title: z.string(),
  keywords: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
  excludeTitle: z.boolean().optional(),
  episodePattern: z.string().optional(),
  excludePattern: z.string().optional(),
  excludes: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
});

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async (argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:add:argv')(argv);

  try {
    const db = await getDb();
    const yz = yargsZodParser.parse(argv);

    const keywords = (yz.keywords ?? []).concat(yz.excludeTitle ? [] : [yz.title]).map(String);
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

    logger.log(t('CMD_ADD_SUCCESS', { title: yz.title }));
  }
  catch (err) {
    debug('dmhy:cli:add')(err);
    console.error(err);
    // @ts-expect-error err is unknown type
    logger.error('dmhy:cli:add')(err.message);
  }
};
