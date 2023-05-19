import debug from 'debug';
import * as logger from '../logger.mjs';
import { t } from '../locale.mjs';

/** @type {import('~types').Downloader['download']} */
export const download = async(thread, config) => {
  debug('dmhy:downloaders:webhook:thread')(thread);
  debug('dmhy:downloaders:webhook:config')(config);

  try {
    if (!config['webhook-url']) {
      return logger.error('dmhy:downloaders:webhook:urlError')(t('DLR_WEBHOOK_URL_ERR'));
    }
    if (!config['webhook-token']) {
      return logger.error('dmhy:downloaders:webhook:tokenError')(t('DLR_WEBHOOK_TOKEN_ERR'));
    }

    // @ts-expect-error
    await fetch(config['webhook-url'], {
      method: 'POST',
      body: JSON.stringify(thread),
      headers: {
        'Content-Type': 'application/json',
        'x-dmhy-token': config['webhook-token'],
      },
    });

    logger.log(t('DLR_WEBHOOK_SUCCESS', { title: thread.title }));
  } catch (error) {
    logger.error('dmhy:downloaders:webhook:error')(thread.title);
    debug('dmhy:downloaders:webhook:error')(error);
  }
};
