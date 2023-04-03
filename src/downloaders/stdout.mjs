import debug from 'debug';
import * as logger from '../logger.mjs';

/**
 * @param {{magnet: string; title: string;}} thread
 */
export const download = async(thread, config) => {
  debug('dmhy:downloaders:stdout:thread')(thread);
  debug('dmhy:downloaders:stdout:config')(config);

  try {
    logger.log(thread.magnet);
  } catch (error) {
    logger.error(thread.title);
    debug('dmhy:downloaders:stdout:error')(error);
  }
};
