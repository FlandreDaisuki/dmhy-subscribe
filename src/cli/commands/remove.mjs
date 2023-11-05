import { z } from 'zod';
import debug from 'debug';

import {
  getAllSubscriptions,
  getMigratedDb,
  isExistingSubscriptionSid,
  removeSubscriptionBySid,
} from '../../database.mjs';
import { t } from '../../locale.mjs';
import * as logger from '../../logger.mjs';
import { arrayAsyncFilter, ask } from '../../utils.mjs';

export const command = 'remove [sid..]';

export const describe = t('CMD_RM_DESC');

export const aliases = ['rm'];

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .usage(t('CMD_RM_USAGE'))
    .option('force', {
      alias: 'f',
      type: 'boolean',
    })
    .example(t('CMD_RM_EXAMPLE1'), t('CMD_RM_EXAMPLE1_DESC'))
    .example(t('CMD_RM_EXAMPLE2'), t('CMD_RM_EXAMPLE2_DESC'))
    .example(t('CMD_RM_EXAMPLE3'), t('CMD_RM_EXAMPLE3_DESC'));
};

const yargsZodParser = z.object({
  sid: z.array(z.unknown()).transform((u) => u.map(String)).optional(),
  force: z.boolean().optional(),
});

/**
 * @param {*} argv
 * @param {() => Promise<import('sqlite3').Database>} getDb For testing dependency injection and not used by yargs
 */
export const handler = async (argv, getDb = getMigratedDb) => {
  debug('dmhy:cli:remove:argv')(argv);

  try {
    const db = await getDb();
    const yz = yargsZodParser.parse(argv);

    const removingSids = (yz.sid ?? []).map((s) => String(s).toUpperCase());

    const removableSids = await arrayAsyncFilter(removingSids, (sid) => isExistingSubscriptionSid(sid, db));
    const unremovableSids = removingSids.filter((sid) => !removableSids.includes(sid));

    debug('dmhy:cli:remove:removableSids')(removableSids);
    debug('dmhy:cli:remove:unremovableSids')(unremovableSids);

    if (unremovableSids.length > 0 && !yz.force) {
      throw new Error(t('CMD_RM_SID_NOT_FOUND', { sid: unremovableSids[0] }));
    }

    const subscriptions = await getAllSubscriptions(db);

    for (const sid of removableSids) {
      const found = subscriptions.find((sub) => sub.sid === sid);
      const answer = yz.force ? 'y' : await ask(t('CMD_RM_PROMPTS_CONFIRM', { title: found?.title }));
      if (/(?:y|yes)/i.test(answer)) {
        await removeSubscriptionBySid(sid, db);
        logger.log(t('CMD_RM_SUCCESS', { title: found?.title }));
      }
    }
  }
  catch (err) {
    debug('dmhy:cli:remove')(err);
    // @ts-expect-error err is unknown type
    logger.error('dmhy:cli:remove')(err.message);
  }
};
