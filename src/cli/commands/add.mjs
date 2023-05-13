import debug from 'debug';

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

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async(argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:add:argv')(argv);

  try {
    const db = await getDb();

    /** @type {string[]} */
    // @ts-expect-error
    const keywords = [].concat(argv.keywords).concat(argv.excludeTitle ? [] : [argv.title]).map(String);
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

    logger.log(t('CMD_ADD_SUCCESS', { title: argv.title }));
  } catch (err) {
    debug('dmhy:cli:add')(err);
    // @ts-expect-error
    logger.error('dmhy:cli:add')(err.message);
  }
};
