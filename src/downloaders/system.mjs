import open from 'open';
import debug from 'debug';
import { t } from '../locale.mjs';
import * as logger from '../logger.mjs';

/** @type {import('~types').Downloader['download']} */
export const download = async(thread, config) => {
  debug('dmhy:downloaders:system:thread')(thread);
  debug('dmhy:downloaders:system:config')(config);

  try {
    await open(thread.magnet);
    logger.log(t('DLR_SYSTEM_SUCCESS', { title: thread.title }));
  } catch (error) {
    logger.error('dmhy:downloaders:system:error')(thread.title);
    debug('dmhy:downloaders:system:error')(error);
  }
};
