import open from 'open';
import debug from 'debug';
import * as logger from '../logger.mjs';

/** @type {import('~types').Downloader['download']} */
export const download = async(thread, config) => {
  debug('dmhy:downloaders:system:thread')(thread);
  debug('dmhy:downloaders:system:config')(config);

  try {
    await open(thread.magnet);
    logger.log(thread.title);
  } catch (error) {
    logger.error(thread.title);
    debug('dmhy:downloaders:system:error')(error);
  }
};
