// @ts-nocheck
import Aria2 from 'aria2';
import debug from 'debug';
import { t } from '../locale.mjs';
import * as logger from '../logger.mjs';

/** @type {import('~types').Downloader['download']} */
export const download = async(thread, config) => {
  debug('dmhy:downloaders:aria2:thread')(thread);
  debug('dmhy:downloaders:aria2:config')(config);

  try {
    const u = new URL(config['aria2-jsonrpc']);
    const rules = [
      [!u.hostname, t('DLR_ARIA2_HOST_ERR')],
      [u.username && u.username !== 'token', t('DLR_ARIA2_SECRET_ERR')],
      [u.username && !u.password, t('DLR_ARIA2_SECRET_ERR')],
    ];
    for (const [rule, msg] of rules) {
      if (rule) {
        return logger.error('dmhy:downloaders:aria2:ruleMsg')(msg);
      }
    }

    const client = new Aria2({
      host: u.hostname,
      port: u.port || 6800,
      secure: false,
      secret: u.password,
      path: u.pathname,
    });
    client.onerror = (err) => { logger.error('dmhy:downloaders:aria2:clientError', err); };

    const opts = {};
    if (config['download-destination']) {
      opts.dir = config['download-destination'];
    }

    return client
      .open()
      .then(() => client.call('addUri', [thread.magnet], opts))
      .then(() => logger.log(t('DLR_ARIA2_SUCCESS', { title: thread.title })))
      .catch(() => logger.error('dmhy:downloaders:aria2:downloadError')({ title: thread.title }))
      .then(() => client.close());
  } catch (error) {
    logger.error('dmhy:downloaders:aria2:error')(thread.title);
    debug('dmhy:downloaders:aria2:error')(error);
  }
};
