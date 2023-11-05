import debug from 'debug';
import * as logger from '../logger.mjs';

/** @type {import('~types').Downloader['download']} */
export const download = async (thread, config) => {
  debug('dmhy:downloaders:stdout:thread')(thread);
  debug('dmhy:downloaders:stdout:config')(config);

  try {
    logger.log(thread.magnet);
  }
  catch (error) {
    logger.error('dmhy:downloaders:stdout:error')(thread.title);
    debug('dmhy:downloaders:stdout:error')(error);
  }
};
