import Aria2 from 'aria2';
import debug from 'debug';
import * as logger from '../logger.mjs';

/**
 * @param {{magnet: string; title: string;}} thread
 */
export const download = async(thread, config) => {
  debug('dmhy:downloaders:aria2:thread')(thread);
  debug('dmhy:downloaders:aria2:config')(config);

  try {
    const u = new URL(config['aria2-jsonrpc']);
    const rules = [
      [!u.hostname, 'You must provide hostname'],
      [u.username && u.username !== 'token', 'Only secret is supported!'],
      [u.username && !u.password, 'You must provide a secret'],
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
      .then(() => logger.log('DOWNLOADER_DL_SUCCESS', { title: thread.title }))
      .catch(() => logger.error('dmhy:downloaders:aria2:downloadError')({ title: thread.title }))
      .then(() => client.close());
  } catch (error) {
    logger.error(thread.title);
    debug('dmhy:downloaders:aria2:error')(error);
  }
};
