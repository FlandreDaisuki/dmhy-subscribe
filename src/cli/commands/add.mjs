import debug from 'debug';

import * as logger from '../../logger.mjs';
import { ask, joinToRegExp, parsePattern } from '../../utils.mjs';
import {
  createSubscription,
  getMigratedDb,
  isExistingSubscriptionTitle,
} from '../../database.mjs';

export const command = 'add <title> [keywords..]';

export const describe = 'add specific keywords to describe a subscription';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
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
    .conflicts('excludes', 'exclude-pattern');
};

export const handler = async(argv) => {
  debug('dmhy:cli:add:argv')(argv);

  try {
    const db = await getMigratedDb();
    if (!(await isExistingSubscriptionTitle(argv.title, db))) {

      const answer = await ask(`資料庫中已有「${argv.title}」，是否繼續新增？（y/N）`);
      if (!/(?:y|yes)/i.test(answer)) {
        return process.exit(1);
      }
    }
    const keywords = [].concat(argv.keywords).concat(argv.excludeTitle ? [] : [argv.title]);
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

    await createSubscription(argv.title, {
      keywords,
      excludePatternString: String(getExcludePattern()),
      episodePatternString: String(episodePattern),
    }, db);

    logger.log(`成功新增「${argv.title}」！`);
  } catch (err) {
    debug('dmhy:cli:add')(err);
    logger.error('dmhy:cli:add')(err.message);
  }
};
